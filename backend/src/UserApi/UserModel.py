from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from typing import Optional


from src.DatabaseConnector import Base, engine
from src.GlobalConfig import settings


class User(Base):
   __tablename__ = settings.TABLE_NAMES['users']

   id = Column(Integer, primary_key=True, index=True) 
   name = Column(String, index=True)
   email = Column(String, unique=True, index=True)


class UserResponse(BaseModel):
   id: int
   name: str
   email: str

   class Config:
      from_attributes = True


class UserCreate(BaseModel):
   name: str
   email: str


class UserUpdate(BaseModel):
   name: Optional[str] = None
   email: Optional[str] = None



Base.metadata.create_all(bind=engine)   