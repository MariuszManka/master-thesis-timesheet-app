from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.GlobalConfig import settings


# ======================== DATABASE INITIALIZATION & CONFIG ========================
engine = create_engine(str(settings.SQL_LITE_DATABASE_URL), connect_args={ "check_same_thread": False })
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# ==================================================================================



# ======================== GET DATABASE =====================
def get_database():
   '''
     Function that allows to     
   
   '''
   database = SessionLocal()

   try: 
      yield database
   finally: 
      database.close()
# ============================================================
