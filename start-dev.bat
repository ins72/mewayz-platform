@echo off
echo Starting Mewayz Development Environment...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting Frontend Server...
cd ..\ui
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this script...
pause > nul 