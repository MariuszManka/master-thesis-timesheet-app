import base64

from fastapi import APIRouter,  UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import List



from src.Auth.AuthModel import Token, Accounts, AccountsResponse, AccountCreate, ExtendedAccountsResponse, UserInfo, UserPreferences, UserAddresses
from src.Auth.AuthConfig import authenticate_user, create_access_token, get_current_active_user, add_user_to_db, fetch_all_users_list, delete_user_from_db, oauth2_scheme, token_blacklist
from src.DatabaseConnector import get_database
from src.GlobalModels import OperationSuccessfulResponse

from src.GlobalConfig import settings, AppRoleEnum
from sqlalchemy.exc import IntegrityError

#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")



authRouter = APIRouter(prefix="/users")


# TODO - WYCIĄGNĄĆ DO OSOBNEGO ROUTERA
@authRouter.post("/login", response_model=Token, tags=["Login API"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_database)):
    user = authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Niepoprawny email lub hasło", headers={ "WWW-Authenticate": "Bearer" })
   

    access_token_expires = timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    user_response = ExtendedAccountsResponse.model_validate(user)                                                

    return Token (
        access_token=access_token,
        token_type="bearer",
        ok=True,
        user_data=user_response
    )


# TODO - WYCIĄGNĄĆ DO OSOBNEGO ROUTERA
@authRouter.post("/logout", status_code=status.HTTP_200_OK, tags=["Login API"])
async def logout(token: str = Depends(oauth2_scheme)):
    """
    Logs out the user by blacklisting their token.
    """
    # Add the token to the blacklist
    token_blacklist.add(token)
    return {"ok": True, "message": "Użytkownik pomyślnie wylogowany."}



@authRouter.post("/create-account", response_model=AccountsResponse, tags=["Accounts API"])
async def create_user(account: AccountCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      logger.info(account)
      return add_user_to_db(db, account)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 




@authRouter.get("/get-current-user/", tags=["Accounts API"])
async def read_users_me(current_user: Accounts = Depends(get_current_active_user)):
   return current_user



@authRouter.get("/get-all-users-list", response_model=List[ExtendedAccountsResponse], tags=["Accounts API"])
async def get_all_users_list(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający listę obecnie utworzonych w systemie kont użytkowników. 
   """
   return fetch_all_users_list(db, current_user)



@authRouter.delete("/delete-user/{user_id}", response_model=OperationSuccessfulResponse, tags=["Accounts API"])
async def delete_user(user_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Endpoint usuwający użytkownika o podanym id z bazy danych.
    """

    if current_user.role not in [AppRoleEnum['admin']]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Odmowa dostępu: tylko administratorzy mogą usuwać użytkowników z bazy danych.",)

    return delete_user_from_db(user_id, db)



#TODO - Przenieść do AuthConfig
@authRouter.post("/upload-avatar", status_code=status.HTTP_200_OK, tags=["Accounts API"])
async def upload_avatar(id: int = Form(...), avatar: UploadFile = File(...), db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Endpoint to upload and save a user's avatar based on the provided account ID.
    """
    try:
        if not id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nie podano parametru Id.")

        # Validate file type (e.g., allow only images)
        if avatar.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Niepoprawny format pliku. Tylko formaty JPEG and PNG są akceptowalne.")


        # Read the uploaded file (binary data)
        avatar_content = await avatar.read()

        # Convert the binary data to a base64 string
        avatar_base64 = base64.b64encode(avatar_content).decode('utf-8')

        # Fetch the user's `user_info` based on the provided ID
        user_info = db.query(UserInfo).filter(UserInfo.account_id == id).first()
        if not user_info:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Błąd. Nie można znaleźć podanego użytkownika w bazie danych.")

        # Save the avatar to the database
        user_info.avatar = avatar_base64
        db.commit()
        db.refresh(user_info)

        return {"isOk": True, "avatarBase64": avatar_base64}

    except Exception as e:
        logger.error(f"Error uploading avatar: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się dodać pliku do bazy danych.")
    

#TODO - Przenieść do AuthConfig
@authRouter.patch("/update-user/{user_id}", response_model=ExtendedAccountsResponse, tags=["Accounts API"])
async def update_account_generic(user_id: int, updates: dict, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Generic endpoint to update account data dynamically.
    """
    try:
        # Fetch the user account to update
        user_to_update = db.query(Accounts).filter(Accounts.id == user_id).first()
        if not user_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono użytkownika o podanym 'id' w bazie danych.")

        # Apply updates to Accounts model dynamically
        for key, value in updates.items():
            if hasattr(user_to_update, key) and not isinstance(value, dict):
                setattr(user_to_update, key, value)


        # Update related models (UserInfo and UserPreferences)
        if settings.TABLE_NAMES['user_info'] in updates:
            user_info_updates = updates[settings.TABLE_NAMES['user_info']]
            user_info = db.query(UserInfo).filter(UserInfo.account_id == user_id).first()

            if not user_info:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono rekordu UserInfo w bazie danych.")
            
            for key, value in user_info_updates.items():
                if hasattr(user_info, key):
                    setattr(user_info, key, value)


        if settings.TABLE_NAMES['user_preferences'] in updates:
            user_preferences_updates = updates[settings.TABLE_NAMES['user_preferences']]
            user_preferences = db.query(UserPreferences).filter(UserPreferences.account_id == user_id).first()

            if not user_preferences:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono rekordu UserPreferences w bazie danych.")
            
            for key, value in user_preferences_updates.items():
                if hasattr(user_preferences, key):
                    setattr(user_preferences, key, value)


        if settings.TABLE_NAMES['user_addresses'] in updates:
            user_addresses_updates = updates[settings.TABLE_NAMES['user_addresses']]
            user_addresses = db.query(UserAddresses).filter(UserAddresses.account_id == user_id).first()

            if not user_addresses:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono rekordu UserAddresses w bazie danych.")
            
            for key, value in user_addresses_updates.items():
                if hasattr(user_addresses, key):
                    setattr(user_addresses, key, value)            


        db.commit()
        db.refresh(user_to_update)

        return ExtendedAccountsResponse.model_validate(user_to_update)

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Użytkownik o podanym adresie email już istnieje.")


    except Exception as e:
        db.rollback()
        logger.error(f"Error updating account: {e}")

        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd: {e}. Nie udało się zaktualizować danych użytkownika.")