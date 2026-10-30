from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse
from .core.config import settings
from .api.endpoints import router as api_router

default_frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
frontend_origins = [
    origin.strip().rstrip("/")
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
] or default_frontend_origins
if any(urlparse(origin).scheme != "https" and urlparse(origin).hostname not in ("localhost", "127.0.0.1") for origin in frontend_origins):
    raise ValueError("FRONTEND_ORIGINS must use HTTPS except for localhost development origins.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent, Offline-First AI Farming Assistant for Indian & Tamil-speaking smallholder farmers."
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": "AGRIGUARD — AI Farmer Companion Backend API is running.",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "health": f"{settings.API_V1_PREFIX}/health"
    }

if __name__ == "__main__":
    import sys
    import os
    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    run_script = os.path.join(backend_root, "run.py")
    if os.path.exists(run_script):
        import runpy
        runpy.run_path(run_script, run_name="__main__")
    else:
        import uvicorn
        uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
