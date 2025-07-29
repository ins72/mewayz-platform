#!/bin/bash

# TechVision Landing Page Deployment Script
# This script helps deploy the application to different platforms

echo "🚀 TechVision Landing Page Deployment Script"
echo "=============================================="

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found!"
    exit 1
fi

echo ""
echo "🌐 Choose deployment platform:"
echo "1) Netlify (Drag & Drop)"
echo "2) Vercel"
echo "3) GitHub Pages"
echo "4) Local Server (serve)"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "📤 Deploying to Netlify..."
        echo "Please drag the 'build' folder to https://app.netlify.com/drop"
        echo "Or use Netlify CLI: netlify deploy --prod --dir=build"
        ;;
    2)
        echo "📤 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
        fi
        ;;
    3)
        echo "📤 Deploying to GitHub Pages..."
        if [ -f "package.json" ]; then
            # Check if gh-pages is installed
            if npm list gh-pages > /dev/null 2>&1; then
                npm run deploy
            else
                echo "📦 Installing gh-pages..."
                npm install --save-dev gh-pages
                echo "📤 Deploying..."
                npm run deploy
            fi
        else
            echo "❌ package.json not found!"
        fi
        ;;
    4)
        echo "🌐 Starting local server..."
        if command -v serve &> /dev/null; then
            serve -s build -l 3000
        else
            echo "📦 Installing serve..."
            npm install -g serve
            serve -s build -l 3000
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!" 