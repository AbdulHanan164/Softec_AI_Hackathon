@echo off
echo === Opportunity Inbox Copilot ===
echo.
echo Starting backend on http://localhost:8010
echo API docs: http://localhost:8010/docs
echo.
echo Starting frontend on http://localhost:5173
echo.

:: Start backend in new window
start "Backend" cmd /k "cd /d %~dp0 && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8010"

:: Wait 2 seconds then start frontend
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo Both servers started. Open http://localhost:5173 in your browser.
