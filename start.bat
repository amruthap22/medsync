@echo off
title Healthcare App Launcher
echo ==========================================
echo    Starting Healthcare Application
echo ==========================================
echo.

set "ROOT=%~dp0"

echo Starting Backend (FastAPI on port 8000)...
start "Healthcare Backend" /D "%ROOT%backend" cmd /k ".\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend (Vite on port 5173)...
start "Healthcare Frontend" /D "%ROOT%frontend" cmd /k "npm run dev"

echo Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ==========================================
echo App opened! Leave the opened terminal
echo windows running while using the app.
echo ==========================================
