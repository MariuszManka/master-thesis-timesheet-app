import base64

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from src.Timesheet.TimesheetModel import TimesheetResponse, TimesheetCreate, Timesheet
from src.Timesheet.TimesheetConfig import add_timesheet_entry_to_db, fetch_user_timesheets_entries, fetch_all_timesheets_by_task
from src.Timesheet.TimesheetConfig import fetch_team_timesheets_entries, update_selected_timesheet, delete_timesheet_from_db
from src.Auth.AuthModel import Accounts
from src.Auth.AuthConfig import get_current_active_user
from src.DatabaseConnector import get_database
from src.Tasks.TasksModels import TasksResponse, Tasks
from src.GlobalModels import OperationSuccessfulResponse

#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")
timesheetRouter = APIRouter(prefix='/timesheet')




@timesheetRouter.get("/get-user-timesheets-entries", response_model=dict, tags=["Timesheet API"])
async def get_all_tasks_list(
   db: Session = Depends(get_database), 
   current_user: Accounts = Depends(get_current_active_user), 
   skip: int = Query(0, alias="offset"), 
   limit: int = Query(10, alias="limit")
):
   """
      Endpoint zwracający wszystkie wpisy timesheet z podziałem na zadania
   """

   # return fetch_all_tasks_list(db, current_user, skip, limit)
   return fetch_user_timesheets_entries(db, current_user, skip, limit)



@timesheetRouter.get("/get-team-timesheets-entries", response_model=dict, tags=["Timesheet API"])
async def get_all_tasks_list(
   db: Session = Depends(get_database), 
   current_user: Accounts = Depends(get_current_active_user), 
   skip: int = Query(0, alias="offset"), 
   limit: int = Query(10, alias="limit")
):
   """
      Endpoint zwracający wszystkie wpisy timesheet z podziałem na zadania
   """

   # return fetch_all_tasks_list(db, current_user, skip, limit)
   return fetch_team_timesheets_entries(db, current_user, skip, limit)



@timesheetRouter.get("/get-task-timesheets", response_model=dict, tags=["Timesheet API"])
async def get_all_timesheets_by_task(
   db: Session = Depends(get_database),
   task_id: int = Query(1, alias="task_id"), 
   current_user: Accounts = Depends(get_current_active_user), 
   skip: int = Query(0, alias="offset"), 
   limit: int = Query(10, alias="limit")
):
   """
      Endpoint zwracający listę wszystkich wspiów do danego zadania
   """

   return fetch_all_timesheets_by_task(db, current_user, task_id, skip, limit)




@timesheetRouter.get("/get-all", response_model=List[TasksResponse], tags=["Timesheet API"])
async def get_all_tasks_list(db: Session = Depends(get_database)):
   """
      Endpoint zwracający wszystkie wpisy timesheet z podziałem na zadania
   """

   # return fetch_all_tasks_list(db, current_user, skip, limit)
   tasks = db.query(Tasks).options(joinedload(Tasks.project)).all()
   task_responses = []

   for task in tasks:
        task_response = TasksResponse(**task.__dict__, projectName=task.project.name if task.project else "")
        task_responses.append(task_response)

   return task_responses




# @timesheetRouter.get("/get-current-user-timesheets", response_model=Optional[List[TimesheetResponse]], tags=["Timesheet API"])
# async def get_current_user_timesheet(
#    db: Session = Depends(get_database), 
#    current_user: Accounts = Depends(get_current_active_user),
#    skip: int = Query(0, alias="offset"), 
#    limit: int = Query(10, alias="limit"),
#    user_id: int = None,
#    search_query: str = None
# ):
#    """
#       Endpoint zwracający wszystkie wpisy timesheet dla danego użytkownika 
#    """

#    return fetch_current_user_timesheets(db, current_user)


@timesheetRouter.post("/add-timesheet-entry", response_model=TimesheetResponse, tags=["Timesheet API"])
async def create_timesheet(timesheetEntry: TimesheetCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      logger.info(timesheetEntry)
      return add_timesheet_entry_to_db(db, current_user, timesheetEntry)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 



@timesheetRouter.patch("/update-timesheet/{timesheet_id}", response_model=TimesheetResponse, tags=["Timesheet API"])
async def update_timesheet(timesheet_id: int, updates: dict, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
    Generic endpoint to update account data dynamically.
   """
   try:
        return update_selected_timesheet(timesheet_id, updates, db)

   except Exception as e:
      db.rollback()
      logger.info(f">>>> Unexpected error occurred: {e}")
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 
    


@timesheetRouter.delete("/delete-timesheet-entry/{timesheet_to_delete_id}", response_model=OperationSuccessfulResponse, tags=["Timesheet API"])
async def delete_timesheet_entry(timesheet_to_delete_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
      Endpoint usuwający wpis timesheet o podanym id z bazy danych.
    """

    return delete_timesheet_from_db(timesheet_to_delete_id, db)