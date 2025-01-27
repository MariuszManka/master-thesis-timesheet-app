from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, Dict, Tuple
from enum import Enum


class AppRoleEnum(str, Enum):  # Enum must be compatible with Pydantic
    admin = "admin"
    manager = "manager"
    employee = "employee"  # Replace these with roles in your `settings.USER_ROLES`


class Settings(BaseSettings):
   model_config = SettingsConfigDict(
      env_file="./.env",
      env_file_encoding='utf-8',
      env_ignore_empty=True,
      extra="ignore",
   )

   ENVIRONMENT: Literal["local", "staging", "production"] = "local"
   TABLE_NAMES: Dict[str, str] = {
      "accounts": "accounts",
      "user_info": "user_info",
      "user_preferences": "user_preferences",
      "user_addresses": "user_addresses",
   }
   
   API_V1_STR: str
   SQL_LITE_DATABASE_URL: str
   PROJECT_NAME: str
   SECRET_KEY: str
   ALGORITHM: str
   ACCESS_TOKEN_EXPIRE_MINUTES: str


settings = Settings()