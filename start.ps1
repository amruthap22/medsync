Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting Healthcare Application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`nStarting Backend (FastAPI on port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; & '.\.venv\Scripts\python.exe' -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Frontend (Vite on port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Opening application in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "`nApp opened! Keep the two terminal windows open while using the app." -ForegroundColor Cyan
