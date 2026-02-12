"""
Application configuration settings.
Uses environment variables with sensible defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Church Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Security - Use environment variable or a stable default for development
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "church-management-dev-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Database - Check for DATABASE_URL environment variable (Vercel/Supabase)
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/church_db")
    
    # For SQLite (simpler setup for development)
    SQLITE_URL: str = "sqlite:///./church_management.db"
    
    # Auto-detect: Use PostgreSQL if DATABASE_URL starts with postgres, else SQLite
    USE_SQLITE: bool = not os.environ.get("DATABASE_URL", "").startswith("postgres")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://churchexc.co.za",
        "https://www.churchexc.co.za",
        "https://churchexc.org",
        "https://www.churchexc.org",
        "http://139.84.231.20",
    ]
    CORS_ALLOW_ALL: bool = os.environ.get("CORS_ALLOW_ALL", "True").lower() == "true"
    
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
    # Check environment variable first (for Vercel/production)
    env_db_url = os.environ.get("DATABASE_URL")
    if env_db_url and env_db_url.startswith("postgres"):
        # Convert postgres:// to postgresql:// for SQLAlchemy compatibility
        if env_db_url.startswith("postgres://"):
            return env_db_url.replace("postgres://", "postgresql://", 1)
        return env_db_url
    
    if settings.USE_SQLITE:
        return settings.SQLITE_URL
    return settings.DATABASE_URL
