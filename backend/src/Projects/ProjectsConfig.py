import logging
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from typing import List

from src.Auth.AuthModel import Accounts
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import AppRoleEnum
from src.Projects.ProjectsModels import Projects, ProjectsSubjectResponse, ProjectResponse, ProjectCreate
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
            projects_query = db.query(Projects).filter(Projects.owner_id == current_user.id).order_by(Projects.created_date.desc())

        else:  # AppRoleEnum.employee
            projects_query = (db.query(Projects).join(Projects.participants).filter(Accounts.id == current_user.id)).order_by(Projects.created_date.desc())


        projects = projects_query.order_by(Projects.id).order_by(Projects.created_date.desc()).all()

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


        projects = projects_query.order_by(Projects.created_date.desc()).all()

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



def add_project_to_db(db: Session, project: ProjectCreate, current_user: Accounts):
    try:
        # Sprawdzenie uprawnień dla użytkownika
        if current_user.role == AppRoleEnum.employee or current_user.role == AppRoleEnum.manager:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do dodania zadania.")

        # Sprawdzenie czy właściciel istnieje w bazie
        projectOwner = db.query(Accounts).filter(Accounts.id == project.owner_id).first()
        if not projectOwner:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nie można dodać projektu. Właściciel zadania o id: { project.owner_id } nie istnieje w bazie danych.")


        project_data = project.model_dump()
        new_project = Projects(**project_data)


        new_project.created_date = datetime.today()

        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        return OperationSuccessfulResponse( ok=True )

    except IntegrityError:
        db.rollback()
        logger.error(f"Projekt o podanym id już istnieje w bazie danych")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Projekt o podanym id już istnieje w bazie danych")


    except Exception as e:
        db.rollback()
        logger.error(f"Błąd podczas dodawania projektu do bazy danych: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd podczas dodawania projektu do bazy danych: {e}")




def delete_project_from_db(project_to_delete_id: int, db: Session, current_user: Accounts) -> OperationSuccessfulResponse:
    """
      Handler usuwający dany projekt z bazy danych
    """
    try:
        project_to_delete = db.query(Projects).filter(Projects.id == project_to_delete_id).first()

        if not project_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono takiego projektu w bazie danych.")


        if current_user.role != AppRoleEnum.admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do usunięcia projektu.")


        db.delete(project_to_delete)
        db.refresh(project_to_delete)
        db.commit()

        return OperationSuccessfulResponse( ok=True )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się usunąć projektu z bazy danych. {e}")
    




def update_selected_project(project_id: int, updates: dict, db: Session, current_user: Accounts):
    try:
        project_to_update = (db.query(Projects).options(joinedload(Projects.tasks), joinedload(Projects.participants)).filter(Projects.id == project_id).first())

        if not project_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono projektu o podanym 'id': {project_id} w bazie  danych.")



        if current_user.role == AppRoleEnum.admin and project_to_update.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do edycji tego projektu.")


        date_fields = ["start_date", "end_date"]
        for key in date_fields:
            if key in updates and isinstance(updates[key], str):
                updates[key] = datetime.strptime(updates[key], "%Y-%m-%d").date()

        for key, value in updates.items():
            if hasattr(project_to_update, key) and key not in ["participants", "assignedTasks", "owner_id"]:
                setattr(project_to_update, key, value)
        

        # Aktualizacja uczestników
        if "participants" in updates:
            participant_ids = updates["participants"]
            participants = db.query(Accounts).filter(Accounts.id.in_(participant_ids)).all()

            if len(participants) != len(participant_ids):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Błąd aktualizacji projektu! Niektórzy uczestnicy nie istnieją w bazie danych.")

            project_to_update.participants = participants

        # Aktualizacja przypisanych zadań
        if "assignedTasks" in updates:
            task_ids = updates["assignedTasks"]
            tasks = db.query(Tasks).filter(Tasks.id.in_(task_ids)).all()

            if len(tasks) != len(task_ids):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Błąd aktualizacji projektu! Niektóre zadania nie istnieją w bazie danych.")

            for task in tasks:
                task.project_id = project_to_update.id

            project_to_update.tasks = tasks

        db.commit()
        db.refresh(project_to_update)

        return OperationSuccessfulResponse(ok=True)


    except Exception as e:
        db.rollback()
        logger.error(f"Błąd podczas aktualizacji projektu: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się zaktualizować projektu. {e}")
