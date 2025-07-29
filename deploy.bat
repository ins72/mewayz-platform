@echo off
chcp 65001 >nul

echo 🚀 TechVision Landing Page Deployment Script
echo ==============================================

REM Build the application
echo 📦 Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Check if build directory exists
if not exist "build" (
    echo ❌ Build directory not found!
    pause
    exit /b 1
)

echo.
echo 🌐 Choose deployment platform:
echo 1) Netlify ^(Drag ^& Drop^)
echo 2) Vercel
echo 3) GitHub Pages
echo 4) Local Server ^(serve^)
echo 5) Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo 📤 Deploying to Netlify...
    echo Please drag the 'build' folder to https://app.netlify.com/drop
    echo Or use Netlify CLI: netlify deploy --prod --dir=build
) else if "%choice%"=="2" (
    echo 📤 Deploying to Vercel...
    vercel --prod
) else if "%choice%"=="3" (
    echo 📤 Deploying to GitHub Pages...
    if exist "package.json" (
        call npm run deploy
    ) else (
        echo ❌ package.json not found!
    )
) else if "%choice%"=="4" (
    echo 🌐 Starting local server...
    serve -s build -l 3000
) else if "%choice%"=="5" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid choice!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment process completed!
pause 