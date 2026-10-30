import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

class Settings(BaseModel):
    APP_NAME: str = "AGRIGUARD — AI Farmer Companion"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Weather configuration
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    DEFAULT_LATITUDE: float = 10.7870 # Thanjavur, Tamil Nadu (Rice Bowl of TN)
    DEFAULT_LONGITUDE: float = 79.1378
    DEFAULT_LOCATION_NAME: str = "Thanjavur, Tamil Nadu"
    WEATHER_CACHE_MINUTES: int = 30
    PORT: int = int(os.getenv("PORT", "8001"))

    # Gemini agriculture assistant (key is backend-only)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    FRONTEND_ORIGINS: str = os.getenv("FRONTEND_ORIGINS", "")
    
    # Model configuration
    MODEL_VERSION: str = "AgriGuard-Vision-v1.4"
    CONFIDENCE_THRESHOLD: float = 0.55
    HIGH_CONFIDENCE_THRESHOLD: float = 0.80
    
    # Data directory
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data_storage")

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
