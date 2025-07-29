@echo off
echo ========================================
echo   COMPREHENSIVE LOCAL SETUP SCRIPT
echo   Idurar ERP CRM + All Projects
echo ========================================
echo.

echo [1/10] Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from https://docker.com/
    pause
    exit /b 1
)

echo ✓ Node.js, Python, and Docker are installed
echo.

echo [2/10] Starting MongoDB with Docker...
echo.

REM Start MongoDB container
docker run -d --name mongodb-local -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

REM Wait for MongoDB to start
timeout /t 5 /nobreak >nul

echo ✓ MongoDB is running on localhost:27017
echo.

echo [3/10] Setting up Idurar ERP CRM Backend...
echo.

cd backend

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file for backend
echo Creating backend environment file...
(
echo NODE_ENV=development
echo PORT=5000
echo MONGODB_URI=mongodb://admin:password@localhost:27017/idurar-erp-crm?authSource=admin
echo JWT_SECRET=your_super_secret_jwt_key_for_local_development_2025
echo JWT_EXPIRE=30d
echo EMAIL_FROM=noreply@localhost
echo EMAIL_TO=admin@localhost
echo RESEND_API_KEY=your_resend_api_key_here
echo AWS_ACCESS_KEY_ID=your_aws_access_key
echo AWS_SECRET_ACCESS_KEY=your_aws_secret_key
echo AWS_REGION=us-east-1
echo AWS_BUCKET_NAME=your_bucket_name
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo CORS_ORIGIN=http://localhost:3000
echo LOG_LEVEL=info
echo BCRYPT_ROUNDS=12
) > .env

cd ..

echo ✓ Backend environment configured
echo.

echo [4/10] Setting up Idurar ERP CRM Frontend...
echo.

cd frontend

REM Install Node.js dependencies
echo Installing frontend dependencies...
npm install

REM Create .env.local file for frontend
echo Creating frontend environment file...
(
echo NEXT_PUBLIC_IDURAR_API_URL=http://localhost:5000
echo NEXT_PUBLIC_IDURAR_API_KEY=your_api_key_here
echo NEXT_PUBLIC_APP_NAME=Idurar ERP CRM
echo NEXT_PUBLIC_APP_VERSION=3.0.0
echo NEXT_PUBLIC_ENABLE_ANALYTICS=true
echo NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
) > .env.local

cd ..

echo ✓ Frontend environment configured
echo.

echo [5/10] Setting up Mewayz 9913 (FastAPI + React)...
echo.

cd ..\mewayz_9913

REM Install Python dependencies for FastAPI backend
if exist backend\requirements.txt (
    cd backend
    echo Installing FastAPI dependencies...
    pip install -r requirements.txt
    
    REM Create .env file for FastAPI
    (
    echo DATABASE_URL=mongodb://admin:password@localhost:27017/mewayz_9913?authSource=admin
    echo JWT_SECRET=your_mewayz_jwt_secret_2025
    echo OPENAI_API_KEY=your_openai_api_key_here
    echo STRIPE_SECRET_KEY=your_stripe_secret_key_here
    echo GOOGLE_CLIENT_ID=your_google_client_id_here
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:3001
    ) > .env
    
    cd ..
)

REM Install React dependencies
if exist frontend\package.json (
    cd frontend
    echo Installing React dependencies...
    npm install
    
    REM Create .env file for React
    (
    echo REACT_APP_API_URL=http://localhost:8001
    echo REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
    echo REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
    ) > .env
    
    cd ..
)

cd ..\idurar-merged

echo ✓ Mewayz 9913 configured
echo.

echo [6/10] Setting up Mewayz Good (FastAPI + Next.js)...
echo.

cd ..\mewayz_good

REM Install Python dependencies for FastAPI backend
if exist backend\requirements.txt (
    cd backend
    echo Installing FastAPI dependencies...
    pip install -r requirements.txt
    
    REM Create .env file for FastAPI
    (
    echo DATABASE_URL=mongodb://admin:password@localhost:27017/mewayz_good?authSource=admin
    echo JWT_SECRET=your_mewayz_good_jwt_secret_2025
    echo STRIPE_SECRET_KEY=your_stripe_secret_key_here
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:3002
    ) > .env
    
    cd ..
)

REM Install Next.js dependencies
if exist frontend\package.json (
    cd frontend
    echo Installing Next.js dependencies...
    npm install
    
    REM Create .env.local file for Next.js
    (
    echo NEXT_PUBLIC_API_URL=http://localhost:8002
    echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
    ) > .env.local
    
    cd ..
)

cd ..\idurar-merged

echo ✓ Mewayz Good configured
echo.

echo [7/10] Setting up Meway (FastAPI + React)...
echo.

cd ..\meway

REM Install Python dependencies for FastAPI backend
if exist backend\requirements.txt (
    cd backend
    echo Installing FastAPI dependencies...
    pip install -r requirements.txt
    
    REM Create .env file for FastAPI
    (
    echo DATABASE_URL=mongodb://admin:password@localhost:27017/meway?authSource=admin
    echo JWT_SECRET=your_meway_jwt_secret_2025
    echo STRIPE_SECRET_KEY=your_stripe_secret_key_here
    echo OPENAI_API_KEY=your_openai_api_key_here
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:3003
    ) > .env
    
    cd ..
)

REM Install React dependencies
if exist frontend\package.json (
    cd frontend
    echo Installing React dependencies...
    npm install
    
    REM Create .env file for React
    (
    echo REACT_APP_API_URL=http://localhost:8000
    echo REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
    ) > .env
    
    cd ..
)

cd ..\idurar-merged

echo ✓ Meway configured
echo.

echo [8/10] Setting up Mewayz Dashboard (Laravel + React)...
echo.

cd ..\mewayz_dashboard

REM Install PHP dependencies for Laravel backend
if exist backend\composer.json (
    cd backend
    echo Installing Laravel dependencies...
    composer install
    
    REM Create .env file for Laravel
    (
    echo APP_NAME="Mewayz Dashboard"
    echo APP_ENV=local
    echo APP_KEY=base64:your_laravel_app_key_here
    echo APP_DEBUG=true
    echo APP_URL=http://localhost:8004
    echo.
    echo DB_CONNECTION=sqlite
    echo DB_DATABASE=database/database.sqlite
    echo.
    echo CACHE_DRIVER=file
    echo SESSION_DRIVER=file
    echo QUEUE_CONNECTION=sync
    ) > .env
    
    REM Create SQLite database
    if not exist database\database.sqlite (
        echo. > database\database.sqlite
    )
    
    REM Run Laravel migrations
    php artisan migrate
    
    cd ..
)

REM Install React dependencies
if exist frontend\package.json (
    cd frontend
    echo Installing React dependencies...
    npm install
    
    REM Create .env file for React
    (
    echo REACT_APP_API_URL=http://localhost:8004/api
    echo REACT_APP_APP_NAME="Mewayz Dashboard"
    ) > .env
    
    cd ..
)

cd ..\idurar-merged

echo ✓ Mewayz Dashboard configured
echo.

echo [9/10] Setting up Mewayz 3814 (Flutter)...
echo.

cd ..\mewayz_3814

REM Check if Flutter is installed
flutter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Flutter is not installed!
    echo Please install Flutter from https://flutter.dev/
    echo Skipping Flutter setup...
) else (
    echo Installing Flutter dependencies...
    flutter pub get
    
    REM Create .env file for Flutter
    (
    echo SUPABASE_URL=http://localhost:54321
    echo SUPABASE_ANON_KEY=your_supabase_anon_key_here
    echo ENCRYPTION_KEY=your_32_character_encryption_key
    echo GOOGLE_CLIENT_ID=your_google_client_id_here
    echo APPLE_CLIENT_ID=com.mewayz.app
    ) > .env
)

cd ..\idurar-merged

echo ✓ Mewayz 3814 configured
echo.

echo [10/10] Creating startup scripts...
echo.

REM Create startup script for all services
(
echo @echo off
echo echo ========================================
echo echo   STARTING ALL LOCAL SERVICES
echo echo ========================================
echo echo.
echo.
echo echo [1] Starting MongoDB...
echo docker start mongodb-local
echo.
echo echo [2] Starting Idurar ERP CRM Backend...
echo start "Idurar Backend" cmd /k "cd backend ^& npm run dev"
echo.
echo echo [3] Starting Idurar ERP CRM Frontend...
echo start "Idurar Frontend" cmd /k "cd frontend ^& npm run dev"
echo.
echo echo [4] Starting Mewayz 9913 Backend...
echo start "Mewayz 9913 Backend" cmd /k "cd ..\mewayz_9913\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
echo.
echo echo [5] Starting Mewayz 9913 Frontend...
echo start "Mewayz 9913 Frontend" cmd /k "cd ..\mewayz_9913\frontend ^& npm start"
echo.
echo echo [6] Starting Mewayz Good Backend...
echo start "Mewayz Good Backend" cmd /k "cd ..\mewayz_good\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
echo.
echo echo [7] Starting Mewayz Good Frontend...
echo start "Mewayz Good Frontend" cmd /k "cd ..\mewayz_good\frontend ^& npm run dev"
echo.
echo echo [8] Starting Meway Backend...
echo start "Meway Backend" cmd /k "cd ..\meway\backend ^& python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo.
echo echo [9] Starting Meway Frontend...
echo start "Meway Frontend" cmd /k "cd ..\meway\frontend ^& npm start"
echo.
echo echo [10] Starting Mewayz Dashboard Backend...
echo start "Mewayz Dashboard Backend" cmd /k "cd ..\mewayz_dashboard\backend ^& php artisan serve --host=0.0.0.0 --port=8004"
echo.
echo echo [11] Starting Mewayz Dashboard Frontend...
echo start "Mewayz Dashboard Frontend" cmd /k "cd ..\mewayz_dashboard\frontend ^& npm start"
echo.
echo echo.
echo echo ========================================
echo echo   ALL SERVICES STARTED!
echo echo ========================================
echo echo.
echo echo Access URLs:
echo echo - Idurar ERP CRM: http://localhost:3000
echo echo - Mewayz 9913: http://localhost:3001
echo echo - Mewayz Good: http://localhost:3002
echo echo - Meway: http://localhost:3003
echo echo - Mewayz Dashboard: http://localhost:3004
echo echo.
echo echo Backend APIs:
echo echo - Idurar API: http://localhost:5000
echo echo - Mewayz 9913 API: http://localhost:8001
echo echo - Mewayz Good API: http://localhost:8002
echo echo - Meway API: http://localhost:8000
echo echo - Mewayz Dashboard API: http://localhost:8004
echo echo.
echo pause
) > start-all-services.bat

echo ✓ Startup script created: start-all-services.bat
echo.

echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo All projects have been configured for local development.
echo.
echo To start all services, run:
echo   start-all-services.bat
echo.
echo Or start individual services:
echo   - Idurar ERP CRM: cd backend ^& npm run dev
echo   - Mewayz 9913: cd ..\mewayz_9913\backend ^& python -m uvicorn main:app --port 8001
echo   - Mewayz Good: cd ..\mewayz_good\backend ^& python -m uvicorn main:app --port 8002
echo   - Meway: cd ..\meway\backend ^& python -m uvicorn main:app --port 8000
echo   - Mewayz Dashboard: cd ..\mewayz_dashboard\backend ^& php artisan serve --port=8004
echo.
echo MongoDB is running on localhost:27017
echo.
pause 