
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Table, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.DatabaseConnector import Base
from src.GlobalConfig import settings
from src.Tasks.TasksModels import TasksResponse


class ProjectStatus(str, Enum):
    not_started = "Nie rozpoczęty"
    in_progress = "W trakcie"
    on_hold = "Wstrzymany"
    completed = "Zakończony"
    cancelled = "Anulowany"


# Tabela pośrednia: uczestnicy projektów
project_participants = Table(
    settings.TABLE_NAMES['project_participants'],
    Base.metadata,
    Column("project_id", ForeignKey(f"{settings.TABLE_NAMES['projects']}.id"), primary_key=True),
    Column("account_id", ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"), primary_key=True),
)

class Projects(Base):
    __tablename__ = settings.TABLE_NAMES['projects']

    id: Mapped[int] = mapped_column(primary_key=True)
    name = Column(String, index=True, unique=True, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)
    created_date = Column(DateTime, index=True, nullable=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey(f"{settings.TABLE_NAMES['accounts']}.id"))
    owner: Mapped["Accounts"] = relationship(back_populates="owned_projects")

    participants: Mapped[List["Accounts"]] = relationship(
        secondary=project_participants,
        back_populates="participating_projects",
    )

    tasks: Mapped[List["Tasks"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
    )

    class Config:
        orm_mode = True



class ProjectBase(BaseModel):
    name: str
    description: str = None
    start_date: date = None
    end_date: Optional[date] = None
    status: Optional[ProjectStatus] = next(iter(ProjectStatus))

    class Config:
        from_attributes = True


class ProjectResponse(ProjectBase):
    id: int
    name: str
    owner_id: int
    created_date: datetime
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    owner_full_name: Optional[str] = None
    status: Optional[ProjectStatus] = next(iter(ProjectStatus))
    tasks: List[TasksResponse] = []
    participants: List["AccountsProjectsResponse"] = []  # <-- jako string
    owner: Optional["AccountsProjectsResponse"] = None   # <-- jako string
    total_time_spent: Optional[float] = None

    class Config:
        from_attributes = True


class ProjectsSubjectResponse(BaseModel):
    id: int
    subject: str

    class Config:
         from_attributes = True

