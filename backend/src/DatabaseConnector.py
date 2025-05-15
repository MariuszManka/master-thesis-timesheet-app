from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.GlobalConfig import settings

import logging
logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)


# ======================== DATABASE INITIALIZATION & CONFIG ========================
engine = create_engine(str(settings.SQL_DATABASE_URL), echo=True)
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
