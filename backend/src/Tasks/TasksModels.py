from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Integer, Date, DateTime, Double, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from typing import Optional, List
from datetime import date, datetime


from src.DatabaseConnector import Base
from src.GlobalConfig import settings, AppRoleEnum
from src.Timesheet.TimesheetModel import Timesheet, TimesheetResponse
from src.Settings.SettingsModel import AllUsersResponse



class AppTaskTypes(str, Enum):
    task = "Zadanie"
    issue = "Błąd"
    meeting = "Spotkanie"
    support = "Wsparcie"
    test = "Testy"


class AppTaskStatuses(str, Enum):
    new = "Nowy"
    undo = "Cofnięte"
    inProgress = "W trakcie"
    codeReview = "Przegląd kodu"
    test = "Testy"
    deploy = "Do wdrożenia"
    closed = "Zamknięte"


class AppTaskPriority(str, Enum):
    low = "Niski"
    normal = "Normalny"
    important = "Ważny"
    urgent = "Pilny"
    immediate = "Natychmiastowy"



account_tasks = Table(
    settings.TABLE_NAMES['account_tasks'],
    Base.metadata,
    Column("task_id", ForeignKey(f"{settings.TABLE_NAMES['tasks']}.id"), primary_key=True),
    Column("account_id", ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), primary_key=True),
)


class Tasks(Base):
    __tablename__ = settings.TABLE_NAMES['tasks']

    id: Mapped[int] = mapped_column(primary_key=True)
    subject = Column(String, index=True)
    description = Column(String, index=True)
    descriptionInHTMLFormat = Column(Text, index=True)
    taskType = Column(String, index=True, nullable=True)
    taskStatus = Column(String, index=True, nullable=True)
    priority = Column(String, index=True, nullable=True)
    startingDate = Column(Date, index=True)
    createdDate = Column(Date, index=True)
    lastUpdateDateTime = Column(DateTime, index=True, nullable=True)
    dueDate = Column(Date, index=True, nullable=True)
    estimatedHours = Column(Double, nullable=True)
    creatorFullName = Column(String, index=True, nullable=False)


    # RELATIONSHIPS
    parentTaskId = Column(Integer, ForeignKey(f"{settings.TABLE_NAMES['tasks']}.id"), nullable=True)
    parent_task = relationship("Tasks", remote_side=[id], backref="child_tasks")

    timesheets = relationship("Timesheet", back_populates="assigned_task", cascade="all, delete-orphan")
    associated_users: Mapped[List["Accounts"]] = relationship(secondary=account_tasks, back_populates="associated_tasks")
    comments: Mapped[List["TaskComments"]] = relationship(back_populates="task", cascade="all, delete-orphan")

    project_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['projects']}.id"), nullable=False)
    project: Mapped["Projects"] = relationship(back_populates="tasks")



    class Config:
        orm_mode = True


class TaskCommentResponse(BaseModel):
    id: int
    task_id: int
    creator_id: int
    creator_full_name: Optional[str] = None
    creator_avatar: Optional[str] = None
    commentContent: str
    createdDateTime: datetime
    lastUpdateDateTime: datetime

    class Config:
        from_attributes = True


class TasksResponse(BaseModel):
    id: int
    subject: str
    description: str
    project_id: Optional[int] = None
    projectName: Optional[str] = None
    descriptionInHTMLFormat: str
    creatorFullName: str
    taskType: Optional[AppTaskTypes] = next(iter(AppTaskTypes))
    taskStatus: Optional[AppTaskStatuses] = next(iter(AppTaskStatuses))
    priority: Optional[AppTaskPriority] = next(iter(AppTaskPriority))
    startingDate: date
    createdDate: date
    dueDate: Optional[date] = None
    lastUpdateDateTime: Optional[datetime] = None
    estimatedHours: Optional[float] = None
    parentTaskId: Optional[int] = None
    parentTask: Optional["TasksResponse"] = None
    total_time_spent_in_hours: Optional[float] = 0

    timesheets: List[TimesheetResponse] = []

    assignedUsers: Optional[List["AllUsersResponse"]] = None  # string-based forward reference
    comments: List[TaskCommentResponse] = []

    class Config:
        from_attributes = True

class TasksSubjectResponse(BaseModel):
    id: int
    subject: str
    createdDate: date
    associatedUserIds: List[int] = []
    class Config:
         from_attributes = True


class TaskInDatabase(Tasks):
   __allow_unmapped__ = True

   class Config:
      from_attributes = True


class TaskCreate(BaseModel):
    subject: str
    description: str
    descriptionInHTMLFormat: str
    project_id: int
    taskType: Optional[AppTaskTypes] = next(iter(AppTaskTypes))
    taskStatus: Optional[AppTaskStatuses] = next(iter(AppTaskStatuses))
    priority: Optional[AppTaskPriority] = next(iter(AppTaskPriority))
    startingDate: date
    dueDate: Optional[date] = None
    estimatedHours: Optional[float] = None
    parentTaskId: Optional[int] = None
    assignedUsers: Optional[List[int]] = None



# ======================== TASK COMMENTS ========================
class TaskComments(Base):
    __tablename__ = settings.TABLE_NAMES['task_comments']

    id: Mapped[int] = mapped_column(primary_key=True)

    commentContent = Column(Text, index=True)
    createdDateTime = Column(DateTime, index=True, nullable=False)
    lastUpdateDateTime = Column(DateTime, index=True, nullable=False)

    # RELATIONSHIPS
    task_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['tasks']}.id"), nullable=False)
    task: Mapped["Tasks"] = relationship(back_populates="comments")

    creator_id = Column(Integer, ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), nullable=False)
    creator = relationship("Accounts", back_populates="task_comments")

    class Config:
        orm_mode = True


class TasksCommentUpdate(BaseModel):
    new_comment_content: str
    comment_to_update_id: int

class TaskCommentCreate(BaseModel):
    task_id: int
    commentContent: str


# =================================================================