from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import select
from sqlalchemy.exc import IntegrityError
from typing import List



from src.DatabaseConnector import get_database
from src.Auth.AuthModel import Accounts, UserInDatabase, TokenData, AccountCreate, AccountsResponse, UserInfo
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import settings, AppRoleEnum



import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/users/login", )
token_blacklist = set()


def verify_password(plain_password, hashed_password):
   return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
   return pwd_context.hash(password)


def get_user(db: Session, email: str):
   try:
      user_data = db.query(Accounts).filter(Accounts.email == email).one_or_none()

      if user_data is None:
         return None

      return user_data

   except Exception as e:
        print("Nie udało się odczytać informacji o obecnym użytkowniku z bazy danych", e)
        return None
   

def authenticate_user(email, password, db):
   user_data = db.query(UserInDatabase).filter(UserInDatabase.email == email).one_or_none()
        
   if not user_data:
      return False
   if not verify_password(password, user_data.hashed_password):
      return False
   
   return user_data


def create_access_token(data: dict, expires_delta: timedelta or None = None):
   to_encode = data.copy()

   if expires_delta:
      expire = datetime.now() + expires_delta

   else: 
      expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

   to_encode.update({ "exp": expire })
   encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

   return encoded_jwt



def verify_access_token(token: str):
    
   # Check if the token is blacklisted
    if token in token_blacklist:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token został unieważniony. Zaloguj się ponownie.", headers={ "WWW-Authenticate": "Bearer" })

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Błędny lub wygasły token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(db: Session = Depends(get_database), token: str = Depends(oauth2_scheme)):
   credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nie można poprawnie zweryfikować użytkownika", headers={ "WWW-Authenticate": "Bearer" })

   try:
      payload = verify_access_token(token)
      verify_token_data: str = payload.get("sub")


      if verify_token_data is None:
         raise credential_exception
      
      token_data = TokenData(email=verify_token_data)

   except JWTError:
      raise credential_exception   


   user_data = get_user(db, email=token_data.email)

   if user_data is None:
      raise credential_exception
   
   return user_data


async def get_current_active_user(current_user: Accounts = Depends(get_current_user)):
   if not current_user.active:
      raise HTTPException(status_code=400, detail="Użytkownik jest nieaktywny")

   return current_user


def add_user_to_db(db: Session, user_data: AccountCreate):
   try:
      # Create a new user instance
      new_user = UserInDatabase(
         email=user_data.email,
         active=user_data.active,
         role=user_data.role,
         hashed_password = get_password_hash(user_data.plane_password)
      )

      # Dodanie nowego użytkownika do bazy danych oraz odświeżenie rekordu
      db.add(new_user)
      db.commit()
      db.refresh(new_user)


      new_user_info = UserInfo (
         account_id=new_user.id,
         full_name=user_data.full_name,
         position=user_data.position
      )

      
      db.add(new_user_info)
      db.commit()
      db.refresh(new_user_info)
      
  
      return AccountsResponse (
         id = new_user.id,
         email = new_user.email,
         active = new_user.active,
         role = new_user.role,
         ok = True
      )
   
   except IntegrityError:
      db.rollback()
      logger.error(f"Użytkownik z podanym adresem email już istnieje")
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Użytkownik z podanym adresem email już istnieje")
   
    
   except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")
   


def fetch_all_users_list(db: Session, current_user: Accounts):
    """
      Handler pozwalający pobrać listę wszystkich użytkowników z bazy danych
    """
    # Check if the current user has admin privileges
    if current_user.role not in [AppRoleEnum['admin']]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Odmowa dostępu: tylko administratorzy mogą przeglądać listę użytkowników.")

    try:
        all_users = db.query(Accounts).all()
        return all_users

    except Exception as e:
        logger.error(f"Failed to fetch user list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy użytkowników z bazy danych")


def delete_user_from_db(user_id: int, db: Session) -> OperationSuccessfulResponse:
    """
      Handler usuwający danego użytkownika z bazy danych
    """
    try:
        user_account_to_delete = db.query(Accounts).filter(Accounts.id == user_id).first()

        if not user_account_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono takiego użytkownika w bazie danych.")

        # Delete the user
        db.delete(user_account_to_delete)
        db.refresh(user_account_to_delete)
        db.commit()

        return OperationSuccessfulResponse( ok=True )
    
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się usunąć użytkownika z bazy danych. {e}")
