@echo off
echo ========================================
echo Core-2 Unified Dashboard Startup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo ========================================
echo Installing Dependencies
echo ========================================

echo Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing backend node_modules...
    npm install
) else (
    echo Backend dependencies already installed
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend node_modules...
    npm install
) else (
    echo Frontend dependencies already installed
)

echo.
echo ========================================
echo Setting up Environment
echo ========================================

cd ..\backend
if not exist .env (
    echo Creating backend .env file...
    copy env.example .env
    echo Backend .env file created from template
) else (
    echo Backend .env file already exists
)

cd ..\frontend
if not exist .env.local (
    echo Creating frontend .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
    echo Frontend .env.local file created
) else (
    echo Frontend .env.local file already exists
)

echo.
echo ========================================
echo Starting Services
echo ========================================

echo Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend development server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Services Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo MongoDB should be running on: mongodb://localhost:27017
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000

echo.
echo ========================================
echo Available Commands:
echo ========================================
echo Backend:
echo   npm run dev     - Start development server
echo   npm start       - Start production server
echo   npm test        - Run tests
echo.
echo Frontend:
echo   npm run dev     - Start development server
echo   npm run build   - Build for production
echo   npm start       - Start production server
echo   npm run lint    - Run linter
echo.
echo ========================================
echo Core-2 Dashboard Features:
echo ========================================
echo - Dashboard with real-time analytics
echo - Customer management with MongoDB
echo - Product catalog with images
echo - Income tracking and transactions
echo - Messaging system
echo - Notification system
echo - Comment system for products
echo - File upload capabilities
echo - Authentication and authorization
echo.
pause 