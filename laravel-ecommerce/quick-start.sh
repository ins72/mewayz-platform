#!/bin/bash

echo "🚀 Laravel Ecommerce Platform - Quick Start Script"
echo "=================================================="

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP 8.1+ first."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer first."
    exit 1
fi

echo "✅ PHP and Composer are installed"

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update database credentials."
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Create database if using SQLite
if grep -q "DB_CONNECTION=sqlite" .env; then
    echo "🗄️ Setting up SQLite database..."
    touch database/database.sqlite
    echo "✅ SQLite database created"
fi

# Run migrations
echo "🔄 Running database migrations..."
php artisan migrate --force

# Install Node.js dependencies and build assets
if command -v npm &> /dev/null; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    
    echo "🏗️ Building assets..."
    npm run build
else
    echo "⚠️ NPM not found. Skipping asset building."
fi

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 775 storage bootstrap/cache

# Create storage link
echo "🔗 Creating storage link..."
php artisan storage:link

echo ""
echo "🎉 Setup complete! You can now start the development server:"
echo ""
echo "   php artisan serve"
echo ""
echo "🌐 Open your browser and go to: http://localhost:8000"
echo ""
echo "📚 For deployment to CloudPanel, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🔧 Additional commands:"
echo "   - php artisan make:seeder ProductSeeder    # Create sample data"
echo "   - php artisan db:seed                      # Seed database"
echo "   - php artisan route:list                   # List all routes"
echo "   - php artisan migrate:fresh --seed         # Reset database with sample data"