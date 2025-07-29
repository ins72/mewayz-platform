@echo off
echo ========================================
echo   SIMPLIFIED LOCAL STARTUP
echo   Idurar ERP CRM + All Projects
echo ========================================
echo.

echo [1/8] Starting MongoDB (if Docker is available)...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    docker start mongodb-local >nul 2>&1
    if %errorlevel% neq 0 (
        echo Starting new MongoDB container...
        docker run -d --name mongodb-local -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
        timeout /t 5 /nobreak >nul
    )
    echo ✓ MongoDB running on localhost:27017
) else (
    echo ⚠ Docker not available - MongoDB setup skipped
    echo Please install Docker Desktop or use external MongoDB
)
echo.

echo [2/8] Starting Idurar ERP CRM Backend...
start "Idurar Backend" cmd /k "cd backend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Idurar Backend starting on localhost:5000
echo.

echo [3/8] Starting Idurar ERP CRM Frontend...
start "Idurar Frontend" cmd /k "cd frontend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Idurar Frontend starting on localhost:3000
echo.

echo [4/8] Starting Mewayz 9913 Backend (FastAPI)...
start "Mewayz 9913 Backend" cmd /k "cd ..\mewayz_9913\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz 9913 Backend starting on localhost:8001
echo.

echo [5/8] Starting Mewayz 9913 Frontend (React)...
start "Mewayz 9913 Frontend" cmd /k "cd ..\mewayz_9913\frontend ^& npm start"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz 9913 Frontend starting on localhost:3001
echo.

echo [6/8] Starting Mewayz Good Backend (FastAPI)...
start "Mewayz Good Backend" cmd /k "cd ..\mewayz_good\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Good Backend starting on localhost:8002
echo.

echo [7/8] Starting Mewayz Good Frontend (Next.js)...
start "Mewayz Good Frontend" cmd /k "cd ..\mewayz_good\frontend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Good Frontend starting on localhost:3002
echo.

echo [8/8] Starting Meway Backend (FastAPI)...
start "Meway Backend" cmd /k "cd ..\meway\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Meway Backend starting on localhost:8000
echo.

echo ========================================
echo   SERVICES STARTED!
echo ========================================
echo.
echo 🌐 Access URLs:
echo.
echo 📊 MAIN PLATFORM (Enhanced Idurar ERP CRM):
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 🚀 MEWAYZ 9913 (Enterprise Platform):
echo    Frontend: http://localhost:3001
echo    Backend API: http://localhost:8001
echo.
echo 🛒 MEWAYZ GOOD (E-commerce Platform):
echo    Frontend: http://localhost:3002
echo    Backend API: http://localhost:8002
echo.
echo 📱 MEWAY (SaaS Platform):
echo    Backend API: http://localhost:8000
echo.
echo 🗄️ DATABASE:
echo    MongoDB: localhost:27017 (if Docker available)
echo.
echo ========================================
echo   SETUP INSTRUCTIONS
echo ========================================
echo.
echo If services fail to start, run these commands manually:
echo.
echo 1. Install dependencies for each project:
echo    cd backend ^& npm install
echo    cd frontend ^& npm install
echo    cd ..\mewayz_9913\backend ^& pip install -r requirements.txt
echo    cd ..\mewayz_9913\frontend ^& npm install
echo    cd ..\mewayz_good\backend ^& pip install -r requirements.txt
echo    cd ..\mewayz_good\frontend ^& npm install
echo    cd ..\meway\backend ^& pip install -r requirements.txt
echo    cd ..\meway\frontend ^& npm install
echo.
echo 2. Start services individually:
echo    cd backend ^& npm run dev
echo    cd frontend ^& npm run dev
echo    cd ..\mewayz_9913\backend ^& python -m uvicorn main:app --port 8001
echo    cd ..\mewayz_9913\frontend ^& npm start
echo    cd ..\mewayz_good\backend ^& python -m uvicorn main:app --port 8002
echo    cd ..\mewayz_good\frontend ^& npm run dev
echo    cd ..\meway\backend ^& python -m uvicorn main:app --port 8000
echo.
echo Press any key to continue...
pause >nul 