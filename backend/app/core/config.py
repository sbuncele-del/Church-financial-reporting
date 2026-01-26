"""
Application configuration settings.
Uses environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Church Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/church_db"
    
    # For SQLite (simpler setup for development)
    SQLITE_URL: str = "sqlite:///./church_management.db"
    USE_SQLITE: bool = True  # Set to False for PostgreSQL in production
    
    # CORS - Allow all origins in production (update for security)
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://*.vercel.app",  # Vercel preview deployments
    ]
    CORS_ALLOW_ALL: bool = False  # Set to True for testing, False for production
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Church Settings
    DEFAULT_CURRENCY: str = "ZAR"  # South African Rand
    FISCAL_YEAR_START_MONTH: int = 1  # January
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_database_url() -> str:
    """Return appropriate database URL based on configuration."""
    if settings.USE_SQLITE:
        return settings.SQLITE_URL
    return settings.DATABASE_URL
