import os

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    class Settings(BaseSettings):
        SECRET_KEY: str = os.getenv("SECRET_KEY", "ai_interview_analyzer_super_secret_key_2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_career_assistant.db")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

        model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
except Exception:
    class Settings:
        SECRET_KEY: str = os.getenv("SECRET_KEY", "ai_interview_analyzer_super_secret_key_2026")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_career_assistant.db")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
