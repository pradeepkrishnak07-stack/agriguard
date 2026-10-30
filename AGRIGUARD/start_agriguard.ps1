Write-Host "========================================================" -ForegroundColor Green
Write-Host "  AGRIGUARD — AI Farmer Companion Startup (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

$RootPath = $PSScriptRoot
$BackendDir = Join-Path $RootPath "backend"
$FrontendDir = Join-Path $RootPath "frontend"
$VenvPython = Join-Path $BackendDir "venv\Scripts\python.exe"

# 1. Validate Environment
if (-not (Test-Path $VenvPython)) {
    Write-Host "[ERROR] Virtual environment Python was not found at:" -ForegroundColor Red
    Write-Host "        $VenvPython" -ForegroundColor Yellow
    Write-Host "Please ensure the virtual environment is set up under backend\venv." -ForegroundColor Red
    pause
    exit 1
}

# 2. Check if Backend is already active
Write-Host "[1/3] Checking if Backend is active on port 8001..." -ForegroundColor Yellow
$backendUp = $false
try {
    $res = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($res.StatusCode -eq 200) { $backendUp = $true }
} catch {
    $backendUp = $false
}

if ($backendUp) {
    Write-Host "[OK] Backend is already running and responsive on port 8001." -ForegroundColor Green
} else {
    Write-Host "[2/3] Starting FastAPI Backend on http://localhost:8001 ..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; & '$VenvPython' run.py"

    Write-Host "Waiting for backend to become ready..." -ForegroundColor Gray
    $ready = $false
    for ($i = 1; $i -le 15; $i++) {
        Start-Sleep -Seconds 1
        try {
            $check = Invoke-WebRequest -Uri "http://127.0.0.1:8001/api/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($check.StatusCode -eq 200) {
                $ready = $true
                Write-Host "[OK] Backend is verified healthy on attempt $i!" -ForegroundColor Green
                break
            }
        } catch {
            # continue polling
        }
    }

    if (-not $ready) {
        Write-Host "[WARNING] Backend did not respond on port 8001 within 15 seconds." -ForegroundColor Yellow
        Write-Host "Please check the Backend PowerShell window for error details." -ForegroundColor Yellow
    }
}

# 3. Start Frontend
Write-Host "`n[3/3] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendDir'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  AGRIGUARD services launched successfully!" -ForegroundColor Green
Write-Host "  ------------------------------------------------------" -ForegroundColor Gray
Write-Host "  Frontend Web App:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API Docs:  http://localhost:8001/docs" -ForegroundColor White
Write-Host "  Health Check:      http://localhost:8001/api/health" -ForegroundColor White
Write-Host "  Readiness Check:   http://localhost:8001/api/health/ready" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
Write-Host "Browser launched! Press Enter to exit launcher (services will remain running)..." -ForegroundColor Cyan
Read-Host
