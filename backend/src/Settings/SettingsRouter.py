import base64

from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List


from src.DatabaseConnector import get_database
from src.Tasks.TasksModels import AppTaskPriority, AppTaskStatuses, AppTaskTypes, Tasks
from src.Timesheet.TimesheetModel import AppTimesheetActivityTypes
from src.Auth.AuthModel import Accounts, UserInfo
from src.Auth.AuthConfig import get_current_active_user
from src.GlobalConfig import settings

from src.Settings.SettingsModel import SettingsResponse, SettingsTaskInfoResponse, AllUsersResponse


#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")
settingsRouter = APIRouter(prefix='/settings')



@settingsRouter.get("/", response_model=SettingsResponse, tags=["Settings API"])
async def get_current_app_settings(current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający konfigurację 
   """
   return SettingsResponse(
      appTaskPriority = [e.value for e in AppTaskPriority],
      appTaskStatuses = [e.value for e in AppTaskStatuses],
      appTaskTypes = [e.value for e in AppTaskTypes],
      appTimesheetActivityTypes = [e.value for e in AppTimesheetActivityTypes],
      appDatabaseDateFormatForFront = settings.DATABASE_DATE_FORMAT_FOR_FRONT,
   )


@settingsRouter.get("/tasks-info", response_model=List[SettingsTaskInfoResponse], tags=["Settings API"])
async def get_current_app_settings(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający tablicę id wszystkich projektów z bazy danych 
   """
   ordered_tasks = db.query(Tasks.id, Tasks.subject).order_by(Tasks.id).all()

   return [{"id": task.id, "label": f"{task.id} - {task.subject}"} for task in ordered_tasks]

    

@settingsRouter.get("/all-users-names", tags=["Settings API"])
async def get_all_users_list(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
      Endpoint zwracający listę obecnie utworzonych w systemie kont użytkowników. 
    """
    users_from_db = db.query(UserInfo.id, UserInfo.full_name).order_by(UserInfo.id).all()

    return [AllUsersResponse(id=user.id, user=user.full_name) for user in users_from_db]