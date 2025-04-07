import base64

from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Query
from typing import List


from src.DatabaseConnector import get_database
from src.Tasks.TasksModels import TasksResponse, TaskCreate, TaskCommentResponse, TaskCommentCreate, TasksCommentUpdate
from src.Auth.AuthModel import Accounts
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import AppRoleEnum
from src.Auth.AuthConfig import get_current_active_user
from src.Tasks.TasksConfig import fetch_all_tasks_list, fetch_single_task, add_task_to_db, delete_task_from_db
from src.Tasks.TasksConfig import  update_selected_task, fetch_assigned_tasks, add_comment_to_task, fetch_comments, delete_comment_from_db, update_selected_comment

#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")
tasksRouter = APIRouter(prefix='/tasks')



@tasksRouter.get("/get-all-tasks-list", response_model=dict, tags=["Tasks API"])
async def get_all_tasks_list(
    db: Session = Depends(get_database), 
    current_user: Accounts = Depends(get_current_active_user), 
    skip: int = Query(0, alias="offset"), 
    limit: int = Query(10, alias="limit"),
    user_id: int = None,
    search_query: str = None
):
   """
      Endpoint zwracający listę obecnie utworzonych w systemie zadań. 
   """

   return fetch_all_tasks_list(db, current_user, skip, limit, user_id, search_query)


@tasksRouter.get("/get-single-task", response_model=TasksResponse, tags=["Tasks API"])
async def get_all_tasks_list(task_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający listę obecnie utworzonych w systemie zadań. 
   """

   return fetch_single_task(db, current_user, task_id)


@tasksRouter.post("/create-task", response_model=TasksResponse, tags=["Tasks API"])
async def create_task(task: TaskCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      logger.info(task)
      return add_task_to_db(db, task)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 



@tasksRouter.delete("/delete-task/{task_to_delete_id}", response_model=OperationSuccessfulResponse, tags=["Tasks API"])
async def delete_user(task_to_delete_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Endpoint usuwający zadanie o podanym id z bazy danych.
    """

    if current_user.role not in [AppRoleEnum['admin']]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Odmowa dostępu: tylko administratorzy mogą usuwać zadania z bazy danych.",)

    return delete_task_from_db(task_to_delete_id, db)


@tasksRouter.patch("/update-task/{task_id}", response_model=TasksResponse, tags=["Tasks API"])
async def update_task(task_id: int, updates: dict, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
    Generic endpoint to update account data dynamically.
   """
   try:
        return update_selected_task(task_id, updates, db)

   except Exception as e:
      db.rollback()
      logger.info(f">>>> Unexpected error occurred: {e}")
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 
    

@tasksRouter.get("/get-current-user-task-list", response_model=List[TasksResponse], tags=["Tasks API"])
async def get_current_user_tasks_list(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Endpoint zwracający listę zadań przypisanych do aktualnie zalogowanego użytkownika.
    """
    return fetch_assigned_tasks(db, current_user)


# ========================= TASK COMMENTS =========================
@tasksRouter.post("/add-comment", response_model=TaskCommentResponse, tags=["Task Comments API"])
async def create_comment(comment: TaskCommentCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      logger.info(comment)
      return add_comment_to_task(db, current_user, comment)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 
   


@tasksRouter.get("/all-task-comments", response_model=List[TaskCommentResponse], tags=["Task Comments API"])
async def get_all_tasks_comment(task_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      return fetch_comments(db, task_id=task_id)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 


@tasksRouter.get("/all-user-comments", response_model=List[TaskCommentResponse], tags=["Task Comments API"])
async def get_all_users_comment(user_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   try:
      return fetch_comments(db, user_id=user_id)
     
   except Exception as e:
        db.rollback()
        logger.info(f">>>> Unexpected error occurred: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 


@tasksRouter.delete("/delete-comment/{comment_to_delete_id}", response_model=OperationSuccessfulResponse, tags=["Task Comments API"])
async def delete_comment(comment_to_delete_id: int, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    """
    Endpoint usuwający komentarz o podanym id z bazy danych.
    """

    return delete_comment_from_db(comment_to_delete_id, current_user, db)


@tasksRouter.patch("/update-comment", response_model=TaskCommentResponse, tags=["Task Comments API"])
async def update_comment(new_comment: TasksCommentUpdate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
    Generic endpoint to update account data dynamically.
   """
   try:
        return update_selected_comment(new_comment, current_user, db)

   except Exception as e:
      db.rollback()
      logger.info(f">>>> Unexpected error occurred: {e}")
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 
   
# @tasksRouter.post("/add-comment", response_model=TaskCommentResponse, tags=["Task Comments API"])
# async def create_comment(comment: TaskCommentCreate, db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
#    try:
#       logger.info(comment)
#       return add_comment_to_task(db, current_user, comment)
     
#    except Exception as e:
#         db.rollback()
#         logger.info(f">>>> Unexpected error occurred: {e}")
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__str__()) 


# =================================================================