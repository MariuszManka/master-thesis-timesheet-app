
from pydantic import BaseModel
from typing import List
from src.GlobalConfig import AppRoleEnum


class SettingsResponse(BaseModel):
   appProjectStatuses: List[str]
   appTaskTypes: List[str]
   appTaskStatuses: List[str]
   appTaskPriority: List[str]
   appTimesheetActivityTypes: List[str]
   appDatabaseDateFormatForFront: str


class SettingsTaskInfoResponse(BaseModel):
   id: int
   label: str

class AllUsersResponse(BaseModel):
    id: int
    user: str

    class Config:
        from_attributes = True