from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Boolean, ForeignKey, BLOB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum

from src.DatabaseConnector import Base
from src.GlobalConfig import settings, AppRoleEnum
from src.Timesheet.TimesheetModel import TimesheetResponse, Timesheet
from typing import Optional, List
from src.Tasks.TasksModels import account_tasks, TasksResponse
from src.Projects.ProjectsModels import project_participants, ProjectResponse


class AddressType(str, Enum):
    primary = "Formalny"
    correspondence = "Korespondencyjny"



class Accounts(Base):
    __tablename__ = settings.TABLE_NAMES['accounts']

    id: Mapped[int] = mapped_column(primary_key=True)
    email = Column(String, unique=True, index=True)
    active = Column(Boolean, index=True)
    role = Column(String, index=True)

    # RELATIONSHIP
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

    timesheets: Mapped[List["Timesheet"]] = relationship(
        back_populates="account",
        cascade="all, delete-orphan",
    )

    associated_tasks: Mapped[List["Tasks"]] = relationship(
        secondary=account_tasks, back_populates="associated_users"
    )

    task_comments: Mapped[List["TaskComments"]] = relationship(
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    owned_projects: Mapped[List["Projects"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    owned_tasks: Mapped[List["Tasks"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    participating_projects: Mapped[List["Projects"]] = relationship(
        secondary=project_participants, back_populates="participants",
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

    address_type = Column(String, nullable=False, index=True)
    street = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False, index=True)
    postal_code = Column(String, nullable=False, index=True)
    house_number = Column(String, nullable=True, index=True)
    flat_number = Column(String, nullable=True, index=True)

    class Config:
        orm_mode = True


class UserInDatabase(Accounts):
   __allow_unmapped__ = True

   hashed_password: Mapped[str] = mapped_column(String)

   class Config:
      from_attributes = True


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



class AccountsResponse(BaseModel):
    id: int
    email: EmailStr
    active: bool
    role: str

    class Config:
        from_attributes = True 

class AccountsProjectsResponse(BaseModel):
    id: int
    email: EmailStr
    active: bool
    role: str
    user_info: Optional[UserInfoResponse] = None

    class Config:
        from_attributes = True 

class AccountCreate(BaseModel):
   email: EmailStr
   active: bool
   role: AppRoleEnum
   position: str
   full_name: str
   plane_password: str



class UserAddressesResponse(BaseModel):
    id: int
    street: str
    address_type: AddressType
    city: str
    postal_code: str
    house_number: Optional[str]
    flat_number: Optional[str]

    class Config:
        from_attributes = True



class UserAddressesUpdateData(BaseModel):
    id: int
    street: Optional[str] = None
    address_type: Optional[AddressType] =  next(iter(AddressType))
    city: Optional[str] = None
    postal_code: Optional[str] = None
    house_number: Optional[str] = None
    flat_number: Optional[str] = None

    class Config:
        from_attributes = True



class ExtendedAccountsResponse(AccountsResponse):
    timesheets: Optional[List[TimesheetResponse]] = None
    user_info: Optional[UserInfoResponse] = None
    user_preferences: Optional[UserPreferencesResponse] = None
    user_addresses: Optional[List[UserAddressesResponse]] = None
    associated_tasks: List[TasksResponse] = []

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


ProjectResponse.model_rebuild()