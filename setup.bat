@echo off
echo 🚀 Idurar ERP CRM - Setup Script
echo =================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20.9.0 or higher first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm 10.2.4 or higher first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Setup Backend
echo.
echo 📁 Setting up Backend...
cd backend

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 🔧 Creating backend environment configuration...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/idurar-erp-crm
        echo JWT_SECRET=your_jwt_secret_here_change_this_in_production
        echo JWT_EXPIRE=30d
        echo EMAIL_FROM=noreply@yourdomain.com
        echo EMAIL_TO=admin@yourdomain.com
        echo RESEND_API_KEY=your_resend_api_key
        echo AWS_ACCESS_KEY_ID=your_aws_access_key
        echo AWS_SECRET_ACCESS_KEY=your_aws_secret_key
        echo AWS_REGION=your_aws_region
        echo AWS_BUCKET_NAME=your_bucket_name
    ) > .env
    echo ✅ Backend .env file created
) else (
    echo ℹ️ Backend .env file already exists
)

cd ..

REM Setup Frontend
echo.
echo 📁 Setting up Frontend...
cd frontend

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo 🔧 Creating frontend environment configuration...
    (
        echo NEXT_PUBLIC_IDURAR_API_URL=http://localhost:5000
        echo NEXT_PUBLIC_IDURAR_API_KEY=your_api_key_here
    ) > .env.local
    echo ✅ Frontend .env.local file created
) else (
    echo ℹ️ Frontend .env.local file already exists
)

cd ..

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next Steps:
echo    1. Start MongoDB (if using local database)
echo    2. Update environment variables in backend/.env and frontend/.env.local
echo    3. Start the backend: cd backend ^&^& npm run dev
echo    4. Start the frontend: cd frontend ^&^& npm run dev
echo    5. Access the application at http://localhost:3000
echo.
echo 📚 Documentation:
echo    • Backend API: http://localhost:5000
echo    • Frontend: http://localhost:3000
echo    • MongoDB: Make sure MongoDB is running on localhost:27017
echo.
echo 🛠️ Useful Commands:
echo    • Backend dev: cd backend ^&^& npm run dev
echo    • Frontend dev: cd frontend ^&^& npm run dev
echo    • Backend build: cd backend ^&^& npm run production
echo    • Frontend build: cd frontend ^&^& npm run build
echo.
echo ✨ Happy coding! 🎉
pause 