@echo off
REM Core 2.0 Enterprise Platform - Production Setup Script for Windows
REM This script sets up the complete production environment

echo 🚀 Starting Core 2.0 Enterprise Platform Production Setup...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "temp" mkdir temp

REM Backend Setup
echo 🔧 Setting up backend...
cd backend

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please update the .env file with your production values
)

cd ..

REM Frontend Setup
echo 🎨 Setting up frontend...
cd frontend

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    (
        echo # Frontend Environment Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:5000/api
        echo NEXT_PUBLIC_APP_NAME=Core 2.0 Enterprise
        echo NEXT_PUBLIC_APP_VERSION=1.0.0
        echo NEXT_PUBLIC_APP_ENV=production
    ) > .env.local
    echo ⚠️  Please update the .env.local file with your production values
)

REM Build frontend for production
echo 🔨 Building frontend for production...
call npm run build

cd ..

REM Create Windows startup script
echo 📝 Creating Windows startup script...
(
    echo @echo off
    echo REM Core 2.0 Enterprise Platform - Production Startup Script
    echo.
    echo echo 🚀 Starting Core 2.0 Enterprise Platform in production mode...
    echo.
    echo REM Start backend
    echo echo Starting backend...
    echo cd backend
    echo start "Core2 Backend" cmd /k "npm start"
    echo cd ..
    echo.
    echo REM Wait for backend to start
    echo timeout /t 5 /nobreak ^>nul
    echo.
    echo REM Start frontend
    echo echo Starting frontend...
    echo cd frontend
    echo start "Core2 Frontend" cmd /k "npm start"
    echo cd ..
    echo.
    echo echo ✅ Core 2.0 Enterprise Platform started successfully!
    echo echo.
    echo echo Access the application at: http://localhost:3000
    echo echo API endpoint: http://localhost:5000/api
    echo echo.
    echo echo Admin credentials:
    echo echo Email: admin@core2enterprise.com
    echo echo Password: admin123456
    echo echo.
    echo pause
) > start-production.bat

REM Create monitoring script
echo 📝 Creating monitoring script...
(
    echo @echo off
    echo REM Core 2.0 Enterprise Platform - Monitoring Script
    echo.
    echo echo === Core 2.0 System Status ===
    echo echo.
    echo REM Check if Node.js processes are running
    echo echo Service Status:
    echo tasklist /FI "IMAGENAME eq node.exe" 2^>NUL ^| find /I /N "node.exe"^>NUL
    echo if "%%ERRORLEVEL%%"=="0" ^(
    echo     echo ✅ Node.js processes: Running
    echo ^) else ^(
    echo     echo ❌ Node.js processes: Not running
    echo ^)
    echo.
    echo echo Disk Usage:
    echo dir /-C
    echo.
    echo pause
) > monitor.bat

echo.
echo 🎉 Production setup completed successfully!
echo.
echo Next steps:
echo 1. Update configuration files with your production values
echo 2. Start the application: start-production.bat
echo 3. Access the admin dashboard: http://localhost:3000/admin
echo 4. Change the default admin password
echo 5. Set up SSL/TLS certificates for production
echo.
echo For more information, see PRODUCTION_COMPLETE.md
echo.
echo ✅ Setup completed! 🚀
pause 