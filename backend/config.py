from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Mock flags
    USE_MOCK_DB: bool = True
    USE_MOCK_LLM: bool = True
    USE_MOCK_TTS: bool = True
    USE_MOCK_STT: bool = True
    USE_MOCK_LIVEKIT: bool = True
    USE_MOCK_CELERY: bool = True
    USE_MOCK_ELSA: bool = True

    # JWT
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # Database
    DATABASE_URL: str = ""

    # LLM
    OPENROUTER_API_KEY: str = ""
    SILICONFLOW_API_KEY: str = ""
    DEFAULT_LLM_PROVIDER: str = "siliconflow"
    DEFAULT_LLM_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"

    # Voice services
    DEEPGRAM_API_KEY: str = ""
    CARTESIA_API_KEY: str = ""

    # LiveKit
    LIVEKIT_URL: str = ""
    LIVEKIT_API_KEY: str = ""
    LIVEKIT_API_SECRET: str = ""

    # Celery / Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    ELSA_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
