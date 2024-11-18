from fastapi import APIRouter
from fastapi import FastAPI

from src.UserApi import UserRouter
from src.GlobalConfig import settings




# ============== ROOT ROUTER ==============
root_router = APIRouter()
# =========================================


# ============== APPLICATION ROUTES DEFINITIONS ==============
root_router.include_router(UserRouter.userRouter)
# ============================================================


# ============== MAIN FASTAPI INSTANCE & CONFIG =======================
app = FastAPI (
   title=settings.PROJECT_NAME,
   openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.include_router(root_router, prefix=settings.API_V1_STR)

# =====================================================================
