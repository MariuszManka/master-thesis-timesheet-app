import logging
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from src.Timesheet.TimesheetModel import Timesheet, TimesheetCreate, TimesheetInDatabase, TimesheetResponse
from src.Auth.AuthModel import Accounts
from src.Tasks.TasksModels import Tasks


logger = logging.getLogger("uvicorn")



def fetch_current_user_timesheets(db: Session, current_user: Accounts):
    """
      Handler pozwalający pobrać listę wszystkich projektów z bazy danych
    """
    try:
        all_timesheets = db.query(Timesheet).filter(Timesheet.accountId == current_user.id).all()

        return all_timesheets

    except Exception as e:
        logger.error(f"Failed to fetch projects list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy timesheetów z bazy danych")


def add_timesheet_entry_to_db(db: Session, timesheetEntry: TimesheetCreate):
   try:
      # Walidacja czy podany użytkownik jest w bazie danych
      if timesheetEntry.accountId:
            userInDatabase = db.query(Accounts).filter(Accounts.id == timesheetEntry.accountId).first()

            if not userInDatabase:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Użytkownik o podanym id: {timesheetEntry.accountId} nie istnieje w bazie danych.")


      # Walidacja czy podane id projektu jest w bazie danych.
      if timesheetEntry.assignedTaskId:
            projectInDatabase = db.query(Tasks).filter(Tasks.id == timesheetEntry.assignedTaskId).first()

            if not projectInDatabase:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Projekt o podanym id: {timesheetEntry.assignedTaskId} nie istnieje w bazie danych.")

    
      # new_timesheet_entry = TimesheetInDatabase (
      #    activityDate = timesheetEntry.activityDate,
      #    timeSpentInHours = timesheetEntry.timeSpentInHours,
      #    taskDescription = timesheetEntry.taskDescription,
      #    activityType = timesheetEntry.activityType,
      #    assignedTaskId = timesheetEntry.assignedTaskId,
      #    accountId = timesheetEntry.accountId
      # )
      new_timesheet_entry = TimesheetInDatabase(**timesheetEntry.model_dump())



      # Dodanie nowego wpisu timesheet do bazy danych oraz odświeżenie rekordu
      db.add(new_timesheet_entry)
      db.commit()
      db.refresh(new_timesheet_entry)

      # TODO - zastanowić się czy trzeba zwracać pełne info czy isOk = True wystarczy
      return TimesheetResponse (
         id = new_timesheet_entry.id,
         activityDate = new_timesheet_entry.activityDate,
         timeSpentInHours = new_timesheet_entry.timeSpentInHours,
         taskDescription = new_timesheet_entry.taskDescription,
         activityType = new_timesheet_entry.activityType,
         assignedTaskId = new_timesheet_entry.assignedTaskId,
         accountId = new_timesheet_entry.accountId,
      )
   
   
   except IntegrityError:
      db.rollback()
      logger.error(f"Wpis timesheet o podanym id już istnieje w bazie danych")
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Projekt o podanym id już istnieje w bazie danych")
   
    
   except Exception as e:
        db.rollback()
        logger.error(f"Błąd podczas dodawania wpisu timesheet do bazy danych: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd podczas dodawania projektu do bazy danych: {e}")
   
