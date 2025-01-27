# from fastapi import APIRouter
# from sqlalchemy.orm import Session
# from fastapi import Depends, HTTPException
# from typing import List


# from src.UserApi.UserModel import User, UserCreate, UserResponse, UserUpdate
# from src.DatabaseConnector import get_database


# userRouter = APIRouter()


# # ================================== POST ==================================
# @userRouter.post("/users", response_model=UserResponse)
# async def create_user(user: UserCreate, db: Session = Depends(get_database)):
#    db_user = User(name=user.name, email=user.email)

#    db.add(db_user)
#    db.commit()
#    db.refresh(db_user)

#    return db_user

# # ===========================================================================



# # ============================== GET ALL USERS ==============================
# @userRouter.get("/users/", response_model=List[UserResponse])
# async def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_database)):
#    users = db.query(User).offset(skip).limit(limit).all()

#    return users

# # ===========================================================================



# # ============================= GET SINGLE USERS =============================
# @userRouter.get("/user/{user_id}", response_model=UserResponse)
# async def read_user(user_id: int, db: Session = Depends(get_database)):
#    db_user = db.query(User).filter(User.id == user_id).first()

#    if db_user is None: 
#       raise HTTPException(status_code=404, detail="User not exist in database")
   
#    return db_user
# # ===========================================================================



# # =========================== UPDATE SINGLE USERS ===========================
# @userRouter.put("/users/{user_id}", response_model=UserResponse)
# async def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_database)):
#    db_user = db.query(User).filter(User.id == user_id).first()

#    if db_user is None: 
#       raise HTTPException(status_code=404, detail="User not exist in database")
   
#    db_user.name = user.name if user.name is not None else db_user.name
#    db_user.email = user.email if user.email is not None else db_user.email

#    db.commit()
#    db.refresh(db_user)

#    return db_user
# # ===========================================================================



# # =========================== DELETE SINGLE USERS ===========================

# @userRouter.delete("/users/{user_id}", response_model=UserResponse)
# async def delete_user(user_id: int,  db: Session = Depends(get_database)):
#    db_user = db.query(User).filter(User.id == user_id).first()

#    if db_user is None: 
#       raise HTTPException(status_code=404, detail="User not exist in database")
   
   
#    db.delete(db_user)
#    db.commit()

#    return db_user
# # ===========================================================================
