from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, Dict



class Settings(BaseSettings):
   model_config = SettingsConfigDict(
      env_file="./.env",
      env_file_encoding='utf-8',
      env_ignore_empty=True,
      extra="ignore",
   )

   ENVIRONMENT: Literal["local", "staging", "production"] = "local"
   TABLE_NAMES: Dict[str, str] = {
      "users": "users"
   }
   
   API_V1_STR: str
   SQL_LITE_DATABASE_URL: str
   PROJECT_NAME: str


settings = Settings()