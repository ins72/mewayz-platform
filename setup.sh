#!/bin/bash

echo "🚀 Idurar ERP CRM - Setup Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20.9.0 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.9.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_warning "Node.js version $NODE_VERSION detected. Version $REQUIRED_VERSION or higher is recommended."
else
    print_success "Node.js version $NODE_VERSION is compatible."
fi

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm 10.2.4 or higher first."
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm -v)
REQUIRED_NPM_VERSION="10.2.4"

if [ "$(printf '%s\n' "$REQUIRED_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$REQUIRED_NPM_VERSION" ]; then
    print_warning "npm version $NPM_VERSION detected. Version $REQUIRED_NPM_VERSION or higher is recommended."
else
    print_success "npm version $NPM_VERSION is compatible."
fi

print_success "Node.js and npm are installed and compatible."

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Setup Backend
echo ""
print_status "Setting up Backend..."

cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating backend environment configuration..."
    cat > .env << EOF
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/idurar-erp-crm

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=admin@yourdomain.com
RESEND_API_KEY=your_resend_api_key

# AWS Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
EOF
    print_success "Backend .env file created"
else
    print_status "Backend .env file already exists"
fi

# Create logs directory
mkdir -p logs

cd ..

# Setup Frontend
echo ""
print_status "Setting up Frontend..."

cd frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend environment configuration..."
    cat > .env.local << EOF
# Frontend Environment Configuration

# API Configuration
NEXT_PUBLIC_IDURAR_API_URL=http://localhost:5000
NEXT_PUBLIC_IDURAR_API_KEY=your_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Idurar ERP CRM
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_SENTRY_DSN=
EOF
    print_success "Frontend .env.local file created"
else
    print_status "Frontend .env.local file already exists"
fi

cd ..

echo ""
print_success "Setup completed!"
echo ""
print_status "Next Steps:"
echo "    1. Start MongoDB (if using local database)"
echo "    2. Update environment variables in backend/.env and frontend/.env.local"
echo "    3. Start the application: npm run dev"
echo "    4. Access the application at http://localhost:3000"
echo ""
print_status "Documentation:"
echo "    • Backend API: http://localhost:5000"
echo "    • Frontend: http://localhost:3000"
echo "    • MongoDB: Make sure MongoDB is running on localhost:27017"
echo ""
print_status "Useful Commands:"
echo "    • Start development: npm run dev"
echo "    • Build for production: npm run build"
echo "    • Run tests: npm run test"
echo "    • Run linting: npm run lint"
echo "    • Clean build artifacts: npm run clean"
echo ""
print_status "Docker Commands:"
echo "    • Start with Docker: docker-compose up -d"
echo "    • Stop Docker services: docker-compose down"
echo "    • View logs: docker-compose logs -f"
echo ""
print_success "Happy coding! 🎉" 