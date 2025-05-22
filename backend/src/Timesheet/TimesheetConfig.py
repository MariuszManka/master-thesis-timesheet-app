import logging
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from src.Timesheet.TimesheetModel import Timesheet, TimesheetCreate, TimesheetInDatabase, TimesheetResponse
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import AppRoleEnum
from src.Projects.ProjectsModels import Projects
from src.Auth.AuthModel import Accounts
from src.Tasks.TasksModels import Tasks
from collections import defaultdict



logger = logging.getLogger("uvicorn")


"""
    1) Użytkownik widzi tylko swoje Timesheety z zadań, do których jest przypisany
"""
def fetch_user_timesheets_entries(db: Session, current_user: Accounts, skip: int = 0, limit: int = 10):
   """
      Handler pozwalający pobrać listę wszystkich timesheetów użytkownika z bazy danych
   """
   try:
      
      user_tasks_query = (db.query(Tasks).join(Tasks.timesheets).options(joinedload(Tasks.timesheets)).filter(Timesheet.accountId == current_user.id).order_by(Tasks.createdDate.desc()))
      
      all_tasks = user_tasks_query.all()

      tasks_with_user_timesheets = [task for task in all_tasks if any(ts.accountId == current_user.id for ts in task.timesheets)]

      total_count = len(tasks_with_user_timesheets)
      limited_user_tasks = tasks_with_user_timesheets[skip:skip+limit]
      tree_data = []
      # total_tasks_nodes = 0

      for task in limited_user_tasks:
            user_timesheets = sorted([ts for ts in task.timesheets if ts.accountId == current_user.id], key=lambda ts: ts.activityDate, reverse=True)
        
            if not user_timesheets:
                continue

            children = []
            childrenTimesheetId = 0
            total_time = 0.0

            for ts in user_timesheets:
                try:
                    time_spent = float(ts.timeSpentInHours)
                except (ValueError, TypeError):
                    time_spent = 0.0

                total_time += time_spent
                childrenTimesheetId += 1

                children.append({
                    "key": f"{task.id}-{childrenTimesheetId}",
                    "data": {
                        "id": ts.id,
                        "taskDescription": ts.taskDescription or "No Description",
                        "creatorFullName": ts.account.user_info.full_name,
                        "timeSpentInHours": str(ts.timeSpentInHours),
                        "activityDate": ts.activityDate,
                        "activityType": ts.activityType,
                        "isCurrentUserTimesheet": True
                    }
                })

            task_node = {
                "key": str(task.id),
                "data": {
                    "id": str(task.id),
                    "taskDescription": task.subject,
                    "creatorFullName": task.creatorFullName,
                    "timeSpentInHours": str(round(total_time, 2)),
                    "activityDate": task.createdDate,
                },
                "children": children
            }

            # total_tasks_nodes += 1
            tree_data.append(task_node)


      return {
         "total": total_count,
         "tree": tree_data
      }


   except Exception as e:
        logger.error(f"Failed to fetch user-assigned tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy projektów przypisanych do użytkownika.")




"""
    1) Użytkownik widzi swoje Timesheety oraz pracowników, z którymi jest przypisany do projektu
    2) Manager widzi swoje Timesheety oraz pracowników z projektów, które prowadzi 

"""
def fetch_team_timesheets_entries(db: Session, current_user: Accounts, skip: int = 0, limit: int = 10):
    """
      Handler pozwalający pobrać listę wszystkich timesheetów z zespołu do którego należy użytkownik
    """
    try:
        allowed_user_ids = { current_user.id }  # Zawsze widzi swoje własne timesheety

        if current_user.role == AppRoleEnum.employee:
            user_projects = db.query(Projects).filter(Projects.participants.any(id=current_user.id)).all()

            for project in user_projects:
                for participant in project.participants:
                    allowed_user_ids.add(participant.id)

        elif current_user.role == AppRoleEnum.manager:
            owned_projects = db.query(Projects).filter(Projects.owner_id == current_user.id).all()

            for project in owned_projects:
                for participant in project.participants:
                    allowed_user_ids.add(participant.id)


        team_tasks = (
            db.query(Tasks)
            .join(Tasks.timesheets)
            .filter(Tasks.timesheets.any(Timesheet.accountId.in_(allowed_user_ids)))
            .distinct()
            .order_by(Tasks.createdDate.desc())
        )
        
        total_count = team_tasks.count()

        if total_count > skip: # Tylko jeśli ilość rekordów jest większa od offsetu, stosujemy go.
            limited_team_tasks = team_tasks.offset(skip).limit(limit).all()

        else: 
            limited_team_tasks = team_tasks.limit(limit).all()


        tree_data = []

        for task in limited_team_tasks:
            task_timesheets = sorted(task.timesheets, key=lambda ts: ts.activityDate, reverse=True)

            if not task_timesheets:
                continue

            children = []
            childrenTimesheetId = 0
            
            total_time = 0.0

            for ts in task_timesheets:
                try:
                    time_spent = float(ts.timeSpentInHours)
                except (ValueError, TypeError):
                    time_spent = 0.0

                total_time += time_spent
                childrenTimesheetId += 1
                isCurrentUserTimesheet = bool(ts.accountId == current_user.id)


                children.append({
                    "key": f"{task.id}-{childrenTimesheetId}",
                    "data": {
                        "id": ts.id,
                        "taskDescription": ts.taskDescription or "No Description",
                        "creatorFullName": ts.account.user_info.full_name,
                        "timeSpentInHours": str(ts.timeSpentInHours),
                        "activityDate": ts.activityDate,
                        "activityType": ts.activityType,
                        "isCurrentUserTimesheet": isCurrentUserTimesheet
                    }
                })

            task_node = {
                "key": str(task.id),
                "data": {
                    "id": str(task.id),
                    "taskDescription": task.subject,
                    "creatorFullName": task.creatorFullName,
                    "timeSpentInHours": str(round(total_time, 2)),
                    "activityDate": task.createdDate,
                    "activityType": task.taskType,
                },
                "children": children
            }

            # total_tasks_nodes += 1
            tree_data.append(task_node)


        return {
            "total": total_count,
            "tree": tree_data
        }


    except Exception as e:
        logger.error(f"Failed to fetch user-assigned tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy projektów przypisanych do użytkownika.")










def fetch_all_timesheets_by_task(db: Session, current_user: Accounts, task_id: int, skip: int = 0, limit: int = 10):
    """
      Handler pozwalający pobrać listę wszystkich wpisów dla danego zdania z bazy danych
    """
    try:
        selected_task = db.query(Tasks).filter(Tasks.id == task_id).one_or_none()

        if selected_task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Błąd. Nie znaleziono zadania o podanym id ({task_id}) w bazie.")
        

        all_timesheets = selected_task.timesheets or []
        total_count = len(all_timesheets)
        paginated_timesheets = all_timesheets[skip:skip + limit]
       
        serialized = [
            TimesheetResponse(
                **ts.__dict__,
                creatorFullName=ts.account.user_info.full_name if ts.account.user_info else "Nieznany  użytkownik",
                isCurrentUserTimesheet=bool(ts.accountId == current_user.id)
            )
            for ts in paginated_timesheets
        ]

        return {
            "total": total_count,
            "timesheets": serialized
        }
    

    except Exception as e:
        logger.error(f"Failed to fetch tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy zadań z bazy danych")







# def fetch_all_tasks_list(db: Session, current_user: Accounts):
#    """
#       Handler pozwalający pobrać listę wszystkich timesheetów z bazy danych
#    """
#    try:
#       # Step 1: Fetch all tasks (adjust this if you want to limit to user's tasks only)
#       all_tasks = db.query(Tasks).all()

#       # Step 2: Fetch all timesheets (filter by user if needed)
#       timesheet_query = db.query(Timesheet)
#       all_timesheets = timesheet_query.all()

#       # Step 3: Group timesheets by assignedTaskId
#       grouped_timesheets = defaultdict(list)
#       for ts in all_timesheets:
#          grouped_timesheets[ts.assignedTaskId].append(ts)

#       # Step 4: Build tree
#       tree_data = []

#       for task in all_tasks:
#          task_timesheets = grouped_timesheets.get(task.id, [])

#          if not task_timesheets: # Skip tasks with no timesheets
#             continue


#          children = []
#          total_time = 0.0

#          for ts in task_timesheets:
#                try:
#                   time_spent = float(ts.timeSpentInHours)
#                except (ValueError, TypeError):
#                   time_spent = 0.0

#                total_time += time_spent

#                children.append({
#                   "key": f"{task.id}-{ts.id}",
#                   "data": {
#                      "id": ts.id,
#                      "description": ts.taskDescription or "No Description",
#                      "timeSpentInHours": str(ts.timeSpentInHours),
#                      "activityDate": ts.activityDate,
#                      "activityType": ts.activityType,
#                   }
#                })

#          task_node = {
#             "key": str(task.id),
#             "data": {
#                "id": str(task.id),
#                "description": task.subject,
#                "timeSpentInHours": str(round(total_time, 2)),
#                "activityDate": task.createdDate,
#             },
#             "children": children
#          }

#          tree_data.append(task_node)

#       return {
#          "total": len(all_tasks),
#          "tree": tree_data
#       }

      

#    except Exception as e:
#       logger.error(f"Failed to fetch projects list: {e}")
#       raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy projektów z bazy danych")


def add_timesheet_entry_to_db(db: Session, current_user: Accounts, timesheetEntry: TimesheetCreate):
   try:
      # Walidacja czy podane id projektu jest w bazie danych.
      if timesheetEntry.assignedTaskId:
         taskInDatabase = db.query(Tasks).filter(Tasks.id == timesheetEntry.assignedTaskId).first()

         if not taskInDatabase:
               raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Projekt o podanym id: {timesheetEntry.assignedTaskId} nie istnieje w bazie danych.")

 
      # Dodanie nowego wpisu timesheet do bazy danych oraz odświeżenie rekordu
      new_timesheet_entry = TimesheetInDatabase(**timesheetEntry.__dict__, accountId=current_user.id) #Każdy wpis Timesheet dodany jest przez aktualnie zalogowanego użytkownika
      db.add(new_timesheet_entry)
      db.commit()
      db.refresh(new_timesheet_entry)
      db.refresh(taskInDatabase)




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
   



def update_selected_timesheet(timesheet_id: int, updates: dict, db: Session):
    try:
        task_to_update = db.query(Timesheet).filter(Timesheet.id == timesheet_id).first()

        if not task_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono wpisu o podanym 'id' w bazie danych.")


        # Convert date strings to datetime.date objects
        date_fields = ["activityDate"]

        for key in date_fields:
            if key in updates and isinstance(updates[key], str):
                updates[key] = datetime.strptime(updates[key], "%Y-%m-%d").date()


        for key, value in updates.items():
            if hasattr(task_to_update, key) and not isinstance(value, dict):
                setattr(task_to_update, key, value)


        # Update the assigned users (if provided)
        if 'assignedTaskId' in updates:
            newAssignedTask = db.query(Tasks).filter(Tasks.id == updates['assignedTaskId']).first()
            task_to_update.assigned_task = newAssignedTask

            if not newAssignedTask:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono projektu o podanym 'id' w bazie danych.")

        

        db.commit()
        db.refresh(task_to_update)

        return TimesheetResponse.model_validate(task_to_update)


    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd: {e}. Nie udało się zaktualizować zadania.")



def delete_timesheet_from_db(timesheet_to_delete_id: int, db: Session) -> OperationSuccessfulResponse:
    """
      Handler usuwający dany wpis timesheet z bazy danych
    """
    try:
        timesheet_to_delete = db.query(Timesheet).filter(Timesheet.id == timesheet_to_delete_id).first()

        if not timesheet_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono takiego wpisu w bazie danych.")

        # Delete the user
        db.delete(timesheet_to_delete)
        db.refresh(timesheet_to_delete)
        db.commit()

        return OperationSuccessfulResponse( ok=True )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się usunąć wpisu z bazy danych. {e}")