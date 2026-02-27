# start_ml_service.ps1 — Run from D:\FixItNow\Backend\ml_service\
# One-time setup + run for the ML priority prediction microservice

$ServiceDir = $PSScriptRoot

Write-Host "`n[ML Service] Setting up environment in $ServiceDir" -ForegroundColor Cyan

# Create venv if missing
if (-not (Test-Path "$ServiceDir\.venv")) {
    Write-Host "[ML Service] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv "$ServiceDir\.venv"
}

# Activate venv
$activate = "$ServiceDir\.venv\Scripts\Activate.ps1"
if (Test-Path $activate) {
    & $activate
} else {
    Write-Host "[ML Service] ERROR: Could not find venv activate script." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[ML Service] Installing dependencies..." -ForegroundColor Yellow
pip install -r "$ServiceDir\requirements.txt" --quiet

# Start the FastAPI server
Write-Host "[ML Service] Starting FastAPI on http://localhost:5001" -ForegroundColor Green
uvicorn main:app --host 0.0.0.0 --port 5001 --reload --app-dir "$ServiceDir"
