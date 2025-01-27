
import base64
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Boolean, ForeignKey, BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship


from src.DatabaseConnector import Base
from src.GlobalConfig import settings, AppRoleEnum
from typing import Optional, List



class Accounts(Base):
    __tablename__ = settings.TABLE_NAMES['accounts']

    id: Mapped[int] = mapped_column(primary_key=True)
    email = Column(String, unique=True, index=True)
    active = Column(Boolean, index=True)
    role = Column(String, index=True)

    user_info: Mapped["UserInfo"] = relationship(
        back_populates="user_account",
        uselist=False,  # Ensures a 1:1 relationship
        lazy="joined",  # Eagerly loads the relationship
        cascade="all, delete-orphan",  # Ensures related UserInfo is deleted
    )
    user_preferences: Mapped["UserPreferences"] = relationship(
        back_populates="user_account",
        uselist=False,  # Ensures a 1:1 relationship
        lazy="joined",  # Eagerly loads the relationship
        cascade="all, delete-orphan",  # Ensures related UserPreferences is deleted
    )
    user_addresses: Mapped[List["UserAddresses"]] = relationship(
        back_populates="user_account",
        cascade="all, delete-orphan",  # Ensures related UserAddresses
    )

    class Config:
        orm_mode = True


class UserInfo(Base):
    __tablename__ = settings.TABLE_NAMES['user_info']

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), unique=True)
    user_account: Mapped["Accounts"] = relationship(back_populates="user_info")

    
    full_name = Column(String, index=True)
    position = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar = Column(String, nullable=True)  # Store as base64 string


    class Config:
        orm_mode = True



class UserPreferences(Base):
    __tablename__ = settings.TABLE_NAMES['user_preferences']

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), unique=True)
    user_account: Mapped["Accounts"] = relationship(back_populates="user_preferences")

    theme = Column(String, nullable=True)

    class Config:
        orm_mode = True


class UserAddresses(Base):
    __tablename__ = settings.TABLE_NAMES['user_addresses']

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), unique=True)
    user_account: Mapped["Accounts"] = relationship(back_populates="user_addresses")

    street = Column(String, nullable=True)

    class Config:
        orm_mode = True


class UserInDatabase(Accounts):
   __allow_unmapped__ = True

   hashed_password: Mapped[str] = mapped_column(String)

   class Config:
      from_attributes = True


class AccountsResponse(BaseModel):
    id: int
    email: EmailStr
    active: bool
    role: str

    class Config:
        from_attributes = True 



class AccountCreate(BaseModel):
   email: EmailStr
   active: bool
   role: AppRoleEnum
   position: str
   full_name: str
   plane_password: str


class UserInfoResponse(BaseModel):
    id: int
    full_name: str
    position: Optional[str] = None
    phone: Optional[str]
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class UserPreferencesResponse(BaseModel):
    id: int
    theme: Optional[str] = None

    class Config:
        from_attributes = True


class UserAddressesResponse(BaseModel):
    id: int
    street: Optional[str] = None

    class Config:
        from_attributes = True


class ExtendedAccountsResponse(AccountsResponse):
    user_info: Optional[UserInfoResponse] = None
    user_preferences: Optional[UserPreferencesResponse] = None
    user_addresses: Optional[List[UserAddressesResponse]] = None

    class Config:
        from_attributes = True

# ========================================= TOKEN =========================================
class Token(BaseModel):
    access_token: str
    token_type: str
    ok: bool
    user_data: ExtendedAccountsResponse
# ==========================================================================================

class TokenData(BaseModel):
   email: str or None = None   


class DeleteUserResponse(BaseModel):
    ok: bool
