import re
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Date, Double, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from typing import Optional, List
from datetime import date

from src.DatabaseConnector import Base
from src.GlobalConfig import settings


class AppTimesheetActivityTypes(str, Enum):
    analysis = "Analiza"
    bugFixing = "Poprawa błędu"
    designing = "Projektowanie"
    implementation = "Implementacja"
    tests = "Testy"
    documenting = "Dokumentowanie"
    meeting = "Spotkanie"
    development = "Rozwój"


class Timesheet(Base):
    __tablename__ = settings.TABLE_NAMES['timesheet']

    id: Mapped[int] = mapped_column(primary_key=True)
    activityDate = Column(Date, index=True, nullable=False)
    timeSpentInHours = Column(Double, index=True, nullable=False)
    taskDescription = Column(String, nullable=True)
    activityType = Column(String, index=True, nullable=False)

    # RELATIONSHIPS
    assignedTaskId = Column(Integer, ForeignKey(f"{settings.TABLE_NAMES['tasks']}.id"), nullable=False)
    assigned_task = relationship("Tasks", back_populates="timesheets")

    accountId = Column(Integer, ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), nullable=False)
    account = relationship("Accounts", back_populates="timesheets")

    class Config:
        orm_mode = True


class TimesheetResponse(BaseModel):
    id: int
    activityDate: date
    timeSpentInHours: float  # If using Time type in SQLAlchemy, return as string
    creatorFullName: Optional[str] = None
    assignedTaskSubject: Optional[str] = None
    taskDescription: Optional[str] = None
    activityType: AppTimesheetActivityTypes
    isCurrentUserTimesheet: Optional[bool] = None
    assignedTaskId: int
    accountId: int

    class Config:
        from_attributes = True


class TimesheetInDatabase(Timesheet):
   __allow_unmapped__ = True

   class Config:
      from_attributes = True


class TimesheetCreate(BaseModel):
    activityDate: date
    timeSpentInHours: float
    taskDescription: Optional[str] = None
    activityType: AppTimesheetActivityTypes
    assignedTaskId: int

    # @field_validator("timeSpentInHours")
    # @classmethod
    # def validate_time_format(cls, value: str) -> str:
    #     pattern = r"^\d{1,2}[:.]\d{2}$"  # Matches "hh:mm" or "hh.mm"
    #     if not re.match(pattern, value):
    #         raise ValueError("Invalid format: Use hh:mm or hh.mm")
    #     return value


    class Config:
        from_attributes = True        