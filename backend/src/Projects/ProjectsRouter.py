from fastapi import APIRouter
from src.DatabaseConnector import get_database
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status, Query
from typing import List

from src.Auth.AuthModel import Accounts
from src.Auth.AuthConfig import get_current_active_user
from src.Projects.ProjectsModels import Projects, ProjectResponse, ProjectsSubjectResponse
from src.Projects.ProjectsConfig import fetch_all_projects_subjects, fetch_all_user_projects


#TODO PRZENIEŚĆ DO JEDNEGO PLIKU
import logging

# Set up logging configuration
logger = logging.getLogger("uvicorn")
projectsRouter = APIRouter(prefix='/projects')


@projectsRouter.get("/get-all-projects-subjects", response_model=List[ProjectsSubjectResponse], tags=["Projects API"])
async def get_all_tasks_subjects( db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
   """
      Endpoint zwracający listę obecnie utworzonych w systemie zadań. 
   """

   return fetch_all_projects_subjects(db, current_user)


@projectsRouter.get("/get-all-user-projects", response_model=List[ProjectResponse], tags=["Projects API"])
def get_all_user_projects(db: Session = Depends(get_database), current_user: Accounts = Depends(get_current_active_user)):
    return fetch_all_user_projects(db, current_user)


@projectsRouter.get("/{project_id}", response_model=ProjectResponse, tags=["Projects API"])
def get_project(project_id: int, db: Session = Depends(get_database)):
    project = db.query(Projects).filter(Projects.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
