@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   AGRIGUARD — AI Farmer Companion Startup
echo ========================================================

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "VENV_PYTHON=%BACKEND_DIR%\venv\Scripts\python.exe"

:: 1. Validate Environment
if not exist "%VENV_PYTHON%" (
    echo [ERROR] Virtual environment Python was not found at:
    echo         %VENV_PYTHON%
    echo Please verify the virtual environment is installed under backend\venv.
    pause
    exit /b 1
)

:: 2. Check if Backend is already running and responsive
echo [1/3] Checking if Backend is already active on port 8001...
set "BACKEND_ALREADY_UP=0"
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/api/health' -TimeoutSec 2 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if !ERRORLEVEL! equ 0 (
    set "BACKEND_ALREADY_UP=1"
    echo [OK] Backend is already running and responding healthy on port 8001.
) else (
    echo [2/3] Launching FastAPI Backend on http://localhost:8001 ...
    start "AGRIGUARD Backend (Port 8001)" /D "%BACKEND_DIR%" cmd /k "venv\Scripts\python.exe run.py"

    echo Waiting for backend to initialize and become ready...
    set "READY=0"
    for /L %%i in (1,1,15) do (
        if !READY! equ 0 (
            timeout /t 1 /nobreak >nul
            powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/api/health' -TimeoutSec 1 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
            if !ERRORLEVEL! equ 0 (
                set "READY=1"
                echo [OK] Backend is active and verified healthy on attempt %%i!
            )
        )
    )

    if !READY! equ 0 (
        echo [WARNING] Backend did not respond on port 8001 within 15 seconds.
        echo Please inspect the "AGRIGUARD Backend (Port 8001)" console window for errors.
    )
)

:: 3. Start Frontend Dev Server
echo.
echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "AGRIGUARD Frontend (Port 5173)" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

echo.
echo ========================================================
echo   AGRIGUARD services launched successfully!
echo   ------------------------------------------------------
echo   Frontend Web App:  http://localhost:5173
echo   Backend API Docs:  http://localhost:8001/docs
echo   Health Check:      http://localhost:8001/api/health
echo   Readiness Check:   http://localhost:8001/api/health/ready
echo ========================================================
echo.
echo Opening http://localhost:5173 in your default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to exit this launcher window (services will stay running)...
pause >nul
