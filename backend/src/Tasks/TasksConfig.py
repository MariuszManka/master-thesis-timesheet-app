import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from typing import List

from src.Auth.AuthModel import Accounts
from src.GlobalModels import OperationSuccessfulResponse
from src.GlobalConfig import AppRoleEnum
from src.Tasks.TasksModels import Tasks, TaskCreate, TasksResponse, TaskCommentCreate
from src.Tasks.TasksModels import TaskComments, TaskCommentResponse, TasksCommentUpdate, TasksSubjectResponse
from src.Settings.SettingsModel import AllUsersResponse
from src.Projects.ProjectsModels import Projects
from src.Timesheet.TimesheetModel import Timesheet

logger = logging.getLogger("uvicorn")




# ============================ HELPER FUNCTIONS ============================
def get_visible_tasks_query(db: Session, current_user: Accounts):
    """
    Zwraca zapytanie do bazy zawężone do zadań, które użytkownik powinien widzieć.
    """
    if current_user.role == AppRoleEnum.admin:
        # Admin widzi wszystkie zdania
        return db.query(Tasks)
    elif current_user.role == AppRoleEnum.manager:
        # Manager widzi tylko zadania z projektów, których jest właścicielem
        return db.query(Tasks).join(Projects).filter(Projects.owner_id == current_user.id)
    elif current_user.role == AppRoleEnum.employee:
        # Użytkownik widzi tylko zadania z projektów, w których uczestniczy
        return (db.query(Tasks).join(Projects).join(Projects.participants).filter(Accounts.id == current_user.id))
 


# Funkcja pomocnicza do sumowania godzin z Timesheet
def calculate_total_time_spent(db: Session, task_id: int) -> float:
    return db.query(func.coalesce(func.sum(Timesheet.timeSpentInHours), 0.0)).filter(Timesheet.assignedTaskId == task_id).scalar()

    
#===========================================================================



"""
    1) Pracownik widzi tylko zadania z projektów, w których uczestniczy
    2) Manager widzi tylko zadania z projektów, których jest właścicielem
    3) Administrator widzi wszystkie zadania

    4) Parametr user_id pozwala na pobranie zadań przypisanych do konkretnego użytkownika
"""
def fetch_all_tasks_list(db: Session, current_user: Accounts, skip: int = 0, limit: int = 10, user_id: int = None, project_id: int = None, search_query: str = None):
    """
      Handler pozwalający pobrać listę wszystkich zadań z bazy danych
    """
    try:
        query = get_visible_tasks_query(db, current_user)
        tasks_response = []

        if user_id:
            query = query.filter(Tasks.associated_users.any(id=user_id))

        if project_id:
            query = query.filter(Tasks.project_id == project_id)

        total_count = query.count()

        if total_count > skip: # Tylko jeśli ilość rekordów jest większa od offsetu, stosujemy go.
            all_tasks = query.offset(skip).limit(limit).all()

        else: 
            all_tasks = query.limit(limit).all()


        if search_query:
            search_term = search_query.lower()
            filtered_tasks = [
                task for task in all_tasks
                if search_term in task.subject.lower()
                or (search_term.isdigit() and int(search_term) == task.id)
                or (task.taskType and search_term in task.taskType.lower())
                or (task.project.name and search_term in task.project.name.lower())
                or (task.taskStatus and search_term in task.taskStatus.lower())
                or (task.priority and search_term in task.priority.lower())
            ]
        else:
            filtered_tasks = all_tasks  # No filtering applied


        for task in filtered_tasks:
            total_time_spent = calculate_total_time_spent(db, task.id)
            assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in task.associated_users]
            task_comments = db.query(TaskComments).filter(TaskComments.task_id == task.id).order_by(TaskComments.lastUpdateDateTime.desc()).all()

            task_comments = [
                TaskCommentResponse(
                    **comment.__dict__,
                    creator_full_name=comment.creator.user_info.full_name if comment.creator and comment.creator.user_info else "Nieznany  użytkownik",
                    creator_avatar=comment.creator.user_info.avatar if comment.creator and comment.creator.user_info else None
                )
                for comment in task_comments
            ]

            parent_task_response = None
            if task.parent_task:
                parent_assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in task.parent_task.associated_users]
                parent_task_response = TasksResponse(
                    **task.parent_task.__dict__, assignedUsers=parent_assigned_users, comments=[], parentTask=None,
                      projectName=task.parent_task.project.name if task.parent_task.project else "",
                      total_time_spent_in_hours=calculate_total_time_spent(db, task.parent_task.id)
                )
            
            single_task_response = TasksResponse(
                **task.__dict__, assignedUsers=assigned_users, comments=task_comments, parentTask=parent_task_response,
                  projectName=task.project.name if task.project else "", total_time_spent_in_hours=total_time_spent
            )

            tasks_response.append(single_task_response)

        return {
            "total": total_count,
            "tasks": tasks_response
        }

    except Exception as e:
        logger.error(f"Failed to fetch tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać listy zadań z bazy danych")



"""
    1) Pracownik widzi tylko zadania z projektów, w których uczestniczy
    2) Manager widzi tylko zadania z projektów, których jest właścicielem
    3) Administrator widzi wszystkie zadania 
"""
def fetch_single_task(db: Session, current_user: Accounts, task_id: int):
    """
      Handler pozwalający pobrać listę wszystkich zadań z bazy danych
    """
    try:
        single_task = (db.query(Tasks).options(joinedload(Tasks.project).joinedload(Projects.participants)).filter(Tasks.id == task_id).one_or_none())

        if single_task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Błąd. Nie znaleziono zadania o podanym id ({task_id}) w bazie.")

        if not single_task.project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Zadanie o id {task_id} nie ma przypisanego projektu.")
        
       
        # >>> Sprawdzenie uprawnień:

        # Jeśli manager nie jest właścicielem projektu, to nie ma dostępu do zadania 
        if current_user.role == AppRoleEnum.manager:
            if single_task.project.owner_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny Manager nie ma dostępu do tego zadania.")
        
        # Jeśli użytkownik nie jest uczestnikiem projektu, to nie ma dostępu do zadania
        elif current_user.role == AppRoleEnum.employee: 
            if current_user not in single_task.project.participants:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik ma dostępu do tego zadania.")

        
        total_time_spent = calculate_total_time_spent(db, single_task.id)
        all_assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in single_task.associated_users]
        all_task_comments = db.query(TaskComments).filter(TaskComments.task_id == task_id).order_by(TaskComments.lastUpdateDateTime.desc()).all()
        all_task_comments = [
                TaskCommentResponse(
                    **comment.__dict__,
                    creator_full_name=comment.creator.user_info.full_name if comment.creator and comment.creator.user_info else "Nieznany  użytkownik",
                    creator_avatar=comment.creator.user_info.avatar if comment.creator and comment.creator.user_info else None
                )
                for comment in all_task_comments
            ]
        
        parent_task_response = None
        if single_task.parent_task:
            parent_assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in single_task.parent_task.associated_users]
            parent_task_response = TasksResponse(
                **single_task.parent_task.__dict__, assignedUsers=parent_assigned_users, comments=[], parentTask=None,
                projectName=single_task.parent_task.project.name if single_task.parent_task.project else "",
                total_time_spent_in_hours=calculate_total_time_spent(db, single_task.parent_task.id)
            )


        return TasksResponse(
            **single_task.__dict__, assignedUsers=all_assigned_users, comments=all_task_comments, parentTask=parent_task_response, 
            projectName=single_task.project.name if single_task.project else "", total_time_spent_in_hours=total_time_spent
        )
    

    except Exception as e:
        logger.error(f"Failed to fetch tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")



"""
    1) Pracownik widzi tylko zadania z projektów, w których uczestniczy
    2) Manager widzi tylko zadania z projektów, których jest właścicielem
    3) Administrator widzi wszystkie zadania 
"""
def fetch_all_tasks_subjects(db: Session, current_user: Accounts):
    """
      Handler pozwalający pobrać listę wszystkich zadań z bazy danych
    """
    try:
        query = query = get_visible_tasks_query(db, current_user)
        all_tasks = query.order_by(Tasks.id).all()

        return [
            TasksSubjectResponse(
                id=task.id,
                subject=task.subject,
                createdDate=task.createdDate,
                associatedUserIds=[user.id for user in task.associated_users]
            )
            for task in all_tasks
        ]
    
    except Exception as e:
        logger.error(f"Failed to fetch tasks list: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Nie udało się pobrać nazw zadań z bazy danych")



"""
    1) Pracownik nie ma uprawnień do dodania zadania
    2) Manager ma uprawnienia do dodania zadania, ale tylko do projektów, których jest właścicielem
    3) Administrator ma uprawnienia do dodania zadań do każdego z projektów 
"""
def add_task_to_db(db: Session, task: TaskCreate, current_user: Accounts):
    try:
        # Sprawdzenie uprawnień dla użytkownika
        if current_user.role == AppRoleEnum.employee:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do dodania zadania.")

        # Sprawdzenie czy projekt istnieje w bazie
        project = db.query(Projects).filter(Projects.id == task.project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nie można dodać zadania. Projekt o id {task.project_id} nie istnieje w bazie danych")

        # Sprawdzenie uprawnień dla managera
        if current_user.role == AppRoleEnum.manager and project.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nie można dodać zadania. Obecny użytkownik nie jest właścicielem projektu do którego próbuje dodać zadanie.")

        # Jeśli podano zadanie nadrzędne, sprawdzamy czy istnieje w bazie
        if task.parentTaskId:
            parent_task = db.query(Tasks).filter(Tasks.id == task.parentTaskId).first()
            if not parent_task:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Zagadnienie nadrzędne o podanym id: {task.parentTaskId} nie istnieje.")


        task_data = task.model_dump(exclude={"assignedUsers"})
        new_task = Tasks(**task_data)

        users = [] 

        if task.assignedUsers:
            users = db.query(Accounts).filter(Accounts.id.in_(task.assignedUsers)).all()

            if not users:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Podani użytkownicy nie istnieją w bazie danych.")

            new_task.associated_users = users


        assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name if user.user_info else "") for user in users]
        new_task.createdDate = datetime.today()
        new_task.creatorFullName = current_user.user_info.full_name if current_user.user_info else ""

        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        total_time_spent = calculate_total_time_spent(db, new_task.id)

        # TODO - zastanowić się czy trzeba zwracać pełne info czy isOk = True wystarczy
        return TasksResponse (
            id = new_task.id,
            subject = new_task.subject,
            description = new_task.description,
            descriptionInHTMLFormat = new_task.descriptionInHTMLFormat,
            taskType = new_task.taskType,
            taskStatus = new_task.taskStatus,
            priority = new_task.priority,
            startingDate = new_task.startingDate,
            dueDate = new_task.dueDate,
            createdDate=new_task.createdDate,
            estimatedHours = new_task.estimatedHours,
            parentTaskId = new_task.parentTaskId,
            assignedUsers=assigned_users,
            creatorFullName=new_task.creatorFullName,
            parentTask=new_task.parent_task,
            project_id=new_task.project_id,
            projectName=new_task.project.name if new_task.project else "",
            total_time_spent_in_hours=total_time_spent
        )

    except IntegrityError:
        db.rollback()
        logger.error(f"Zadanie o podanym id już istnieje w bazie danych")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zadanie o podanym id już istnieje w bazie danych")


    except Exception as e:
        db.rollback()
        logger.error(f"Błąd podczas dodawania zadania do bazy danych: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd podczas dodawania zadania do bazy danych: {e}")



"""
    1) Pracownik nie ma uprawnień do usunięcia zadania
    2) Manager nie ma uprawnień do usunięcia zadania, które nie należy do jego projektu
    3) Administrator ma uprawnienia do usunięcia wszystkich zadań 
"""
def delete_task_from_db(task_to_delete_id: int, db: Session, current_user: Accounts) -> OperationSuccessfulResponse:
    """
      Handler usuwający dany projekt z bazy danych
    """
    try:
        task_to_delete = db.query(Tasks).filter(Tasks.id == task_to_delete_id).first()

        if not task_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono takiego zadania w bazie danych.")


        if current_user.role == AppRoleEnum.employee:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do usunięcia zadania.")

        elif current_user.role == AppRoleEnum.manager and task_to_delete.project.owner_id != current_user.id:
            if task_to_delete.project.owner_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie jest właścicielem projektu do którego należy zdanie, nie może go usunąć.")


        # Delete the user
        db.delete(task_to_delete)
        db.refresh(task_to_delete)
        db.commit()

        return OperationSuccessfulResponse( ok=True )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się usunąć zadania z bazy danych. {e}")
    


"""
    1) Pracownik ma prawo do aktualizacji zadania, ale tylko w przypadku gdy jest do niego przypisany
    2) Manager ma prawo do aktualizacji wszystkich zadań, z projektów, których jest właścicielem
    3) Administrator ma uprawnienia do aktualizacji wszystkich zadań 
"""
def update_selected_task(task_id: int, updates: dict, db: Session, current_user: Accounts):
    try:
      task_to_update = (db.query(Tasks).options(joinedload(Tasks.project)).filter(Tasks.id == task_id).first())

      if not task_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono zadania o podanym 'id' w bazie danych.")


      if not task_to_update.project:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zadanie nie ma przypisanego projektu lub projekt został usunięty.")

      #  >>> Sprawdzenie uprawnień:
      if current_user.role == AppRoleEnum.manager and task_to_update.project.owner_id != current_user.id:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do aktualizacji zadania z projektu, którego nie jest właścicielem")
      
      elif current_user.role == AppRoleEnum.employee:
        is_user_assigned = any(user.id == current_user.id for user in task_to_update.associated_users)

        if not is_user_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Obecny użytkownik nie ma uprawnień do aktualizacji zadania, do którego nie jest przypisany.")



      # Convert date strings to datetime.date objects
      date_fields = ["startingDate", "dueDate"]
      for key in date_fields:
        if key in updates and isinstance(updates[key], str):
            updates[key] = datetime.strptime(updates[key], "%Y-%m-%d").date()

      for key, value in updates.items():
        if hasattr(task_to_update, key) and not isinstance(value, dict):
            setattr(task_to_update, key, value)


        # Update the assigned users (if provided)
      if 'assignedUsers' in updates:
        assigned_user_ids = updates['assignedUsers']  # Expecting a list of user IDs

        # Fetch users from the database based on the provided user IDs
        users = db.query(Accounts).filter(Accounts.id.in_(assigned_user_ids)).all()

        if len(users) != len(assigned_user_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Błąd dodawania zadania! Niektórzy użytkownicy nie istnieją w bazie danych.")

        task_to_update.associated_users = users


      task_to_update.lastUpdateDateTime = datetime.today()   
        
      db.commit()
      db.refresh(task_to_update)


      parent_task_response = None
      if task_to_update.parent_task:
        parent_assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in task_to_update.parent_task.associated_users]
        parent_task_response = TasksResponse(
            **task_to_update.parent_task.__dict__, assignedUsers=parent_assigned_users, comments=[], parentTask=None,
            projectName=task_to_update.parent_task.project.name if task_to_update.parent_task.project else "",
            total_time_spent_in_hours=calculate_total_time_spent(db, task_to_update.parent_task.id)
        )

      assigned_users = [AllUsersResponse(id=user.id, user=user.user_info.full_name) for user in task_to_update.associated_users]
      total_time_spent = calculate_total_time_spent(db, task_to_update.id)

      task_response = TasksResponse(
        **task_to_update.__dict__,
        assignedUsers=assigned_users,
        parentTask=parent_task_response,
        projectName=task_to_update.project.name if task_to_update.project else "",
        total_time_spent_in_hours=total_time_spent,
      )
        

      return task_response


    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się zaktualizować zadania. {e}")
    






# def fetch_assigned_tasks(db: Session, current_user: Accounts) -> List[TasksResponse]:
#     """
#     Pobiera zadania przypisane do użytkownika na podstawie relacji associated_tasks.
#     """
#     try:
#         user_with_tasks = db.query(Accounts).filter(Accounts.id == current_user.id).first()

#         if not user_with_tasks:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Użytkownik nie znaleziony.")

        
#         return [TasksResponse.model_validate({ **task.__dict__, 'parentTask': task.parent_task }) for task in user_with_tasks.associated_tasks]
    
#     except Exception as e:
#         logger.error(f"Nie udało się pobrać przypisanych zadań: {e}")
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Błąd serwera: nie udało się pobrać zadań.")






# ========================= TASK COMMENTS =========================
def add_comment_to_task(db: Session, current_user: Accounts, comment: TaskCommentCreate):
    """
    Adds a comment to a specific task.
    """
    try:
        task = db.query(Tasks).filter(Tasks.id == comment.task_id).first()
        
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zadanie nie istnieje.")

        new_comment = TaskComments (
            task_id = comment.task_id,
            creator_id = current_user.id,
            commentContent = comment.commentContent,
            createdDateTime = datetime.today(),
            lastUpdateDateTime = datetime.today()
        )

        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)


        return TaskCommentResponse (
            id = new_comment.id,
            task_id = new_comment.task_id,
            creator_id = new_comment.creator_id,
            commentContent = new_comment.commentContent,
            createdDateTime = new_comment.createdDateTime,
            lastUpdateDateTime = new_comment.lastUpdateDateTime,
        )
    
    except Exception as e:
        db.rollback()
        logger.error(f"Błąd podczas dodawania komentarza: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Błąd podczas dodawania komentarza.")



def fetch_comments(db: Session, task_id: int = None, user_id: int = None):
    """
    Fetches comments based on task_id or user_id.
    - If task_id is provided, fetches all comments related to the task.
    - If user_id is provided, fetches all comments created by the user.
    - If neither is provided, raises an error.
    """
    try:
        if not task_id and not user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brak wymaganych parametrów: task_id lub user_id.")

        query = db.query(TaskComments)

        if task_id:
            query = query.filter(TaskComments.task_id == task_id)

        if user_id:
            query = query.filter(TaskComments.creator_id == user_id)

        all_comments = query.order_by(TaskComments.lastUpdateDateTime.desc()).all()

        
        return [
            TaskCommentResponse(
                **comment.__dict__,
                creator_full_name=comment.creator.user_info.full_name if comment.creator and comment.creator.user_info else "Nieznany  użytkownik",
                creator_avatar=comment.creator.user_info.avatar if comment.creator and comment.creator.user_info else None
            )
            for comment in all_comments
        ]
    
    except Exception as e:
        logger.error(f"Błąd podczas pobierania komentarzy: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Błąd podczas pobierania komentarzy.")
    


def delete_comment_from_db(comment_to_delete_id: int, current_user: Accounts, db: Session) -> OperationSuccessfulResponse:
    """
      Handler usuwający dany projekt z bazy danych
    """
    try:
        comment_to_delete = db.query(TaskComments).filter(TaskComments.id == comment_to_delete_id).first()

        if comment_to_delete.creator_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Podany użytkownik nie ma uprawnień do usunięcia tego komentarza.")

        if not comment_to_delete:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Nie znaleziono takiego komentarza w bazie danych.")

        # Delete the user
        db.delete(comment_to_delete)
        db.refresh(comment_to_delete)
        db.commit()

        return OperationSuccessfulResponse( ok=True )

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Nie udało się usunąć zadania z bazy danych. {e}")



def update_selected_comment(new_comment: TasksCommentUpdate, current_user: Accounts, db: Session):
    try:
        comment_to_update = db.query(TaskComments).filter(TaskComments.id == new_comment.comment_to_update_id).first()

        if comment_to_update.creator_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Podany użytkownik nie ma uprawnień do modyfikacji tego komentarza.")


        if not comment_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono komentarza o podanym 'id' w bazie danych.")


        comment_to_update.commentContent = new_comment.new_comment_content
        comment_to_update.lastUpdateDateTime = datetime.today()
        comment_to_update.creator_full_name = comment_to_update.creator.user_info.full_name if comment_to_update.creator and comment_to_update.creator.user_info else "Nieznany  użytkownik"
        comment_to_update.creator_avatar = comment_to_update.creator.user_info.avatar if comment_to_update.creator and comment_to_update.creator.user_info else None
        
        db.commit()
        db.refresh(comment_to_update)


        return TaskCommentResponse.model_validate(comment_to_update)
        

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Błąd: {e}. Nie udało się zaktualizować zadania.")
   
# ========================================================================    