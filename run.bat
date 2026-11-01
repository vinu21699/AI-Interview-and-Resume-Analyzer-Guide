@echo off
set "PATH=C:\Users\vinu2\tools\node-v20.18.0-win-x64;C:\Users\vinu2\tools\uv;%PATH%"

echo Starting NexHire AI Backend (FastAPI)...
start "Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting NexHire AI Frontend (Vite)...
start "Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 3000"

echo.
echo ========================================================
echo NexHire AI is running!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo ========================================================
