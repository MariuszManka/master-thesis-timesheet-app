import logging
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from typing import List

from src.Auth.AuthModel import Accounts
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import AppRoleEnum
from src.Projects.ProjectsModels import Projects, ProjectsSubjectResponse, ProjectResponse
from src.Auth.AuthModel import AccountsProjectsResponse
from sqlalchemy import func
from src.Tasks.TasksModels import Tasks
from src.Timesheet.TimesheetModel import Timesheet

logger = logging.getLogger("uvicorn")


# ============================ HELPER FUNCTIONS ============================
def calculate_project_time_spent(db: Session, project_id: int) -> float:
    """
    Oblicza łączny czas pracy (w godzinach) spędzony nad wszystkimi zadaniami w danym projekcie.
    """
    try:
        # Pobieramy sumę timeSpentInHours z Timesheet powiązanych z zadaniami w projekcie
        total_hours = db.query(func.coalesce(func.sum(Timesheet.timeSpentInHours), 0.0))\
            .join(Tasks, Timesheet.assignedTaskId == Tasks.id)\
            .filter(Tasks.project_id == project_id)\
            .scalar()

        return total_hours

    except Exception as e:
        logger.error(f"Błąd przy obliczaniu czasu dla projektu {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Błąd przy obliczaniu czasu spędzonego nad projektem.")
# =============================================================================

"""
    1) Pracownik widzi tylko zadania z projektów, w których uczestniczy
    2) Manager widzi tylko zadania z projektów, których jest właścicielem
    3) Administrator widzi wszystkie zadania 
"""
def fetch_all_projects_subjects(db: Session, current_user: Accounts):
   """
      Handler pozwalający pobrać listę wszystkich zadań z bazy danych
   """
   try:
        
        # >>> Sprawdzanie uprawnień
        if current_user.role == AppRoleEnum.admin:
            projects_query = db.query(Projects)

        elif current_user.role == AppRoleEnum.manager:
            projects_query = db.query(Projects).filter(Projects.owner_id == current_user.id)

        else:  # AppRoleEnum.employee
            projects_query = (db.query(Projects).join(Projects.participants).filter(Accounts.id == current_user.id))


        projects = projects_query.order_by(Projects.id).all()

        return [ProjectsSubjectResponse(id=project.id, subject=project.name) for project in projects]



   except Exception as e:
        logger.error(f"Błąd pobierania projektów: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd podczas pobierania projektów z bazy danych. {e}")



"""
    1) Pracownik widzi tylko zadania z projektów, w których uczestniczy
    2) Manager widzi tylko zadania z projektów, których jest właścicielem
    3) Administrator widzi wszystkie zadania 
"""
def fetch_all_user_projects(db: Session, current_user: Accounts):
   """
      Handler pozwalający pobrać listę wszystkich zadań z bazy danych
   """
   try:
        
        # >>> Sprawdzanie uprawnień
        if current_user.role == AppRoleEnum.admin:
            projects_query = db.query(Projects)

        elif current_user.role == AppRoleEnum.manager:
            projects_query = db.query(Projects).filter(Projects.owner_id == current_user.id)

        else:  # AppRoleEnum.employee
            projects_query = (db.query(Projects).join(Projects.participants).filter(Accounts.id == current_user.id))


        projects = projects_query.order_by(Projects.created_date).all()

        responses = []

        for project in projects:
            response = ProjectResponse.model_validate(project, from_attributes=True)
            response.owner_full_name = getattr(project.owner.user_info, "full_name", None)
            response.owner = AccountsProjectsResponse.model_validate(project.owner, from_attributes=True)
            response.participants = response.participants = [AccountsProjectsResponse.model_validate(p, from_attributes=True) for p in project.participants if p.id != project.owner_id]

            response.total_time_spent = calculate_project_time_spent(db, project.id)
            
            responses.append(response)

        
        return responses


   except Exception as e:
        logger.error(f"Błąd pobierania projektów: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd podczas pobierania projektów z bazy danych. {e}")

