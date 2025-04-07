import base64

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Depends
from typing import List, Optional
from sqlalchemy.orm import Session

from src.Timesheet.TimesheetModel import TimesheetResponse, TimesheetCreate
from src.Timesheet.TimesheetConfig import fetch_current_user_timesheets, add_timesheet_entry_to_db
from src.Auth.AuthModel import Accounts
from src.Auth.AuthConfig import get_current_active_user
from src.DatabaseConnector import get_database


#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")
timesheetRouter = APIRouter(prefix='/timesheet')



@timesheetRouter.get("/get-current-user-timesheets", response_model=Optional[List[TimesheetResponse]], tags=["Timesheet API"])
async def get_current_user_timesheet(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający wszystkie wpisy timesheet dla danego użytkownika 
   """

   return fetch_current_user_timesheets(db, current_user)


@timesheetRouter.post("/add-timesheet-entry", response_model=TimesheetResponse, tags=["Timesheet API"])
async def create_project(timesheetEntry: TimesheetCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      logger.info(timesheetEntry)
      return add_timesheet_entry_to_db(db, timesheetEntry)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 
