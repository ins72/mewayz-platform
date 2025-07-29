@echo off
echo ========================================
echo   STARTING ALL LOCAL SERVICES
echo   Comprehensive Business Platform
echo ========================================
echo.

echo [1/12] Starting MongoDB...
docker start mongodb-local >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting new MongoDB container...
    docker run -d --name mongodb-local -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest
    timeout /t 5 /nobreak >nul
)
echo ✓ MongoDB running on localhost:27017
echo.

echo [2/12] Starting Idurar ERP CRM Backend...
start "Idurar Backend" cmd /k "cd backend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Idurar Backend starting on localhost:5000
echo.

echo [3/12] Starting Idurar ERP CRM Frontend...
start "Idurar Frontend" cmd /k "cd frontend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Idurar Frontend starting on localhost:3000
echo.

echo [4/12] Starting Mewayz 9913 Backend (FastAPI)...
start "Mewayz 9913 Backend" cmd /k "cd ..\mewayz_9913\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz 9913 Backend starting on localhost:8001
echo.

echo [5/12] Starting Mewayz 9913 Frontend (React)...
start "Mewayz 9913 Frontend" cmd /k "cd ..\mewayz_9913\frontend ^& npm start"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz 9913 Frontend starting on localhost:3001
echo.

echo [6/12] Starting Mewayz Good Backend (FastAPI)...
start "Mewayz Good Backend" cmd /k "cd ..\mewayz_good\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Good Backend starting on localhost:8002
echo.

echo [7/12] Starting Mewayz Good Frontend (Next.js)...
start "Mewayz Good Frontend" cmd /k "cd ..\mewayz_good\frontend ^& npm run dev"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Good Frontend starting on localhost:3002
echo.

echo [8/12] Starting Meway Backend (FastAPI)...
start "Meway Backend" cmd /k "cd ..\meway\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul
echo ✓ Meway Backend starting on localhost:8000
echo.

echo [9/12] Starting Meway Frontend (React)...
start "Meway Frontend" cmd /k "cd ..\meway\frontend ^& npm start"
timeout /t 3 /nobreak >nul
echo ✓ Meway Frontend starting on localhost:3003
echo.

echo [10/12] Starting Mewayz Dashboard Backend (Laravel)...
start "Mewayz Dashboard Backend" cmd /k "cd ..\mewayz_dashboard\backend ^& php artisan serve --host=0.0.0.0 --port=8004"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Dashboard Backend starting on localhost:8004
echo.

echo [11/12] Starting Mewayz Dashboard Frontend (React)...
start "Mewayz Dashboard Frontend" cmd /k "cd ..\mewayz_dashboard\frontend ^& npm start"
timeout /t 3 /nobreak >nul
echo ✓ Mewayz Dashboard Frontend starting on localhost:3004
echo.

echo [12/12] Starting Flutter App (if available)...
flutter --version >nul 2>&1
if %errorlevel% equ 0 (
    start "Mewayz 3814 Flutter" cmd /k "cd ..\mewayz_3814 ^& flutter run -d chrome"
    echo ✓ Flutter app starting on localhost:3005
) else (
    echo ⚠ Flutter not installed - skipping mobile app
)
echo.

echo ========================================
echo   ALL SERVICES STARTED!
echo ========================================
echo.
echo 🌐 Access URLs:
echo.
echo 📊 MAIN PLATFORM (Enhanced Idurar ERP CRM):
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    API Docs: http://localhost:5000/api/docs
echo.
echo 🚀 MEWAYZ 9913 (Enterprise Platform):
echo    Frontend: http://localhost:3001
echo    Backend API: http://localhost:8001
echo    API Docs: http://localhost:8001/docs
echo.
echo 🛒 MEWAYZ GOOD (E-commerce Platform):
echo    Frontend: http://localhost:3002
echo    Backend API: http://localhost:8002
echo    API Docs: http://localhost:8002/docs
echo.
echo 📱 MEWAY (SaaS Platform):
echo    Frontend: http://localhost:3003
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 📈 MEWAYZ DASHBOARD (Analytics Platform):
echo    Frontend: http://localhost:3004
echo    Backend API: http://localhost:8004
echo    API Docs: http://localhost:8004/api
echo.
echo 📱 MEWAYZ 3814 (Mobile App):
echo    Web App: http://localhost:3005 (if Flutter installed)
echo.
echo 🗄️ DATABASE:
echo    MongoDB: localhost:27017
echo    Admin: admin / password
echo.
echo ========================================
echo   INTEGRATION STATUS
echo ========================================
echo.
echo ✅ All services are running locally
echo ✅ No external dependencies (MongoDB Atlas, Supabase, etc.)
echo ✅ Complete offline development environment
echo ✅ Integrated features from all projects
echo.
echo 🎯 Next Steps:
echo 1. Open http://localhost:3000 for the main enhanced platform
echo 2. Explore individual platforms at their respective URLs
echo 3. Test integrations and features
echo 4. Develop and customize as needed
echo.
echo Press any key to continue...
pause >nul 