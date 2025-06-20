from fastapi import APIRouter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from src.CustomHttpsRedirectMiddleware import CustomHTTPSRedirectMiddleware
from src.Auth import AuthRouter
from src.Tasks import TasksRouter
from src.Settings import SettingsRouter
from src.Timesheet import TimesheetRouter
from src.Projects import ProjectsRouter
from src.GlobalConfig import settings
from src.DatabaseConnector import Base, engine


# ============== ROOT ROUTER ==============
root_router = APIRouter()
# =========================================


# ============== CREATE ALL MODELS ==============
Base.metadata.create_all(bind=engine)
# =========================================

# ============== APPLICATION ROUTES DEFINITIONS ==============
root_router.include_router(AuthRouter.authRouter)
root_router.include_router(TasksRouter.tasksRouter)
root_router.include_router(SettingsRouter.settingsRouter)
root_router.include_router(TimesheetRouter.timesheetRouter)
root_router.include_router(ProjectsRouter.projectsRouter)
# ============================================================


# ============== MAIN FASTAPI INSTANCE & CONFIG =======================
origins = [
    "http://localhost:3000",  # REACT DEVELOPMENT SERVER
    "https://master-thesis-timesheet-app.up.railway.app"  # PRODUCTION DOMAIN
]

app = FastAPI (
   title=settings.PROJECT_NAME,
   openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(CustomHTTPSRedirectMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows only listed origins
    allow_credentials=True,  # Allows cookies and other credentials
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(root_router, prefix=settings.API_V1_STR)

# =====================================================================
