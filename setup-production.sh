#!/bin/bash

# Core 2.0 Enterprise Platform - Production Setup Script
# This script sets up the complete production environment

set -e

echo "🚀 Starting Core 2.0 Enterprise Platform Production Setup..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check npm version
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed. Please install MongoDB first."
    print_status "You can install MongoDB using:"
    echo "  Ubuntu/Debian: sudo apt-get install mongodb"
    echo "  macOS: brew install mongodb-community"
    echo "  Or download from: https://www.mongodb.com/try/download/community"
fi

# Create necessary directories
print_status "Creating necessary directories..."

mkdir -p logs
mkdir -p uploads
mkdir -p backups
mkdir -p temp

# Backend Setup
print_status "Setting up backend..."

cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cp env.example .env
    print_warning "Please update the .env file with your production values"
fi

# Frontend Setup
print_status "Setting up frontend..."

cd ../frontend

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Core 2.0 Enterprise
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
EOF
    print_warning "Please update the .env.local file with your production values"
fi

# Build frontend for production
print_status "Building frontend for production..."
npm run build

cd ..

# Database Setup
print_status "Setting up database..."

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    print_status "Starting MongoDB..."
    mongod --fork --logpath logs/mongod.log
    sleep 3
fi

# Create database and collections
print_status "Creating database and collections..."
cd backend
node -e "
const mongoose = require('mongoose');
const config = require('./config/production');

async function setupDatabase() {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');
        
        // Create collections if they don't exist
        const db = mongoose.connection.db;
        
        // Create indexes for better performance
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });
        await db.collection('users').createIndex({ status: 1 });
        await db.collection('users').createIndex({ createdAt: -1 });
        
        await db.collection('products').createIndex({ name: 1 });
        await db.collection('products').createIndex({ creator: 1 });
        await db.collection('products').createIndex({ status: 1 });
        
        await db.collection('transactions').createIndex({ userId: 1 });
        await db.collection('transactions').createIndex({ type: 1 });
        await db.collection('transactions').createIndex({ status: 1 });
        await db.collection('transactions').createIndex({ createdAt: -1 });
        
        await db.collection('settings').createIndex({ key: 1 }, { unique: true });
        
        console.log('Database setup completed');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
"

cd ..

# Create admin user
print_status "Creating admin user..."
cd backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/appModels/User');
const Admin = require('./src/models/coreModels/Admin');
const config = require('./config/production');

async function createAdminUser() {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: config.admin.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash(config.admin.password, config.security.bcryptRounds);
        
        const adminUser = new User({
            name: config.admin.name,
            email: config.admin.email,
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });
        
        await adminUser.save();
        
        // Create admin record
        const adminRecord = new Admin({
            userId: adminUser._id,
            permissions: ['all'],
            isSuperAdmin: true
        });
        
        await adminRecord.save();
        
        console.log('Admin user created successfully');
        console.log('Email:', config.admin.email);
        console.log('Password:', config.admin.password);
        console.log('Please change the password after first login');
        
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
"

cd ..

# Create PM2 ecosystem file for production
print_status "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'core2-backend',
      script: './backend/src/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'core2-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Create nginx configuration
print_status "Creating nginx configuration..."
mkdir -p nginx
cat > nginx/core2.conf << EOF
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /_next/static {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create systemd service files
print_status "Creating systemd service files..."
sudo tee /etc/systemd/system/core2-backend.service > /dev/null << EOF
[Unit]
Description=Core 2.0 Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/core2-frontend.service > /dev/null << EOF
[Unit]
Description=Core 2.0 Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create backup script
print_status "Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash

# Core 2.0 Enterprise Platform - Backup Script

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="core2_backup_$DATE"

echo "Creating backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup database
echo "Backing up database..."
mongodump --db core2-enterprise --out "$BACKUP_DIR/$BACKUP_NAME/database"

# Backup uploads
echo "Backing up uploads..."
cp -r backend/uploads "$BACKUP_DIR/$BACKUP_NAME/"

# Backup configuration files
echo "Backing up configuration..."
cp backend/.env "$BACKUP_DIR/$BACKUP_NAME/backend.env"
cp frontend/.env.local "$BACKUP_DIR/$BACKUP_NAME/frontend.env"

# Create archive
echo "Creating archive..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

# Clean up
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
EOF

chmod +x backup.sh

# Create monitoring script
print_status "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

# Core 2.0 Enterprise Platform - Monitoring Script

echo "=== Core 2.0 System Status ==="
echo

# Check if services are running
echo "Service Status:"
if pgrep -f "core2-backend" > /dev/null; then
    echo "✅ Backend: Running"
else
    echo "❌ Backend: Not running"
fi

if pgrep -f "core2-frontend" > /dev/null; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not running"
fi

if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB: Running"
else
    echo "❌ MongoDB: Not running"
fi

echo

# Check disk usage
echo "Disk Usage:"
df -h . | tail -1

echo

# Check memory usage
echo "Memory Usage:"
free -h

echo

# Check recent logs
echo "Recent Errors (last 10 lines):"
if [ -f "logs/backend-error.log" ]; then
    echo "Backend errors:"
    tail -10 logs/backend-error.log
fi

if [ -f "logs/frontend-error.log" ]; then
    echo "Frontend errors:"
    tail -10 logs/frontend-error.log
fi
EOF

chmod +x monitor.sh

# Create production startup script
print_status "Creating production startup script..."
cat > start-production.sh << 'EOF'
#!/bin/bash

# Core 2.0 Enterprise Platform - Production Startup Script

echo "🚀 Starting Core 2.0 Enterprise Platform in production mode..."

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    mongod --fork --logpath logs/mongod.log
    sleep 3
fi

# Start backend
echo "Starting backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Core 2.0 Enterprise Platform started successfully!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Access the application at: http://localhost:3000"
echo "API endpoint: http://localhost:5000/api"
echo
echo "Admin credentials:"
echo "Email: admin@core2enterprise.com"
echo "Password: admin123456"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-production.sh

# Create README for production
print_status "Creating production README..."
cat > PRODUCTION_README.md << 'EOF'
# Core 2.0 Enterprise Platform - Production Setup

## Overview
This is the production setup for Core 2.0 Enterprise Platform, a comprehensive admin system with full CRUD operations and real-time data management.

## Quick Start

### 1. Start the Application
```bash
./start-production.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Dashboard**: http://localhost:3000/admin

### 3. Default Admin Credentials
- **Email**: admin@core2enterprise.com
- **Password**: admin123456

## Production Features

### ✅ Complete Admin System
- **Dashboard**: Real-time system statistics and monitoring
- **User Management**: Full CRUD operations for user accounts
- **System Settings**: Comprehensive configuration management
- **Security Center**: Security monitoring and threat detection
- **Analytics**: Detailed system analytics and reporting
- **Database Management**: Database monitoring and optimization
- **Content Management**: Manage all platform content

### ✅ Real Data Integration
- **No Mock Data**: All data comes from real database operations
- **Live Statistics**: Real-time system metrics and performance data
- **Dynamic Content**: All content is dynamically loaded from APIs
- **Real-time Updates**: Live updates for system alerts and activities

### ✅ Production Ready
- **Error Handling**: Comprehensive error handling and logging
- **Security**: JWT authentication, rate limiting, and security headers
- **Performance**: Optimized database queries and caching
- **Monitoring**: System health monitoring and alerting
- **Backup**: Automated backup system
- **Scalability**: Designed for horizontal scaling

## API Endpoints

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/settings` - System settings
- `GET /api/admin/security/events` - Security events
- `GET /api/admin/analytics/overview` - Analytics overview
- `GET /api/admin/database/stats` - Database statistics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Entity Management
- `GET /api/{entity}/list` - List entities
- `POST /api/{entity}/create` - Create entity
- `GET /api/{entity}/read/:id` - Read entity
- `PATCH /api/{entity}/update/:id` - Update entity
- `DELETE /api/{entity}/delete/:id` - Delete entity

## Configuration

### Environment Variables
Update the following files with your production values:
- `backend/.env` - Backend configuration
- `frontend/.env.local` - Frontend configuration

### Database
The application uses MongoDB. Ensure MongoDB is running and accessible.

### Security
- Change default admin password after first login
- Update JWT secrets in production
- Configure proper CORS settings
- Set up SSL/TLS certificates

## Monitoring

### Check System Status
```bash
./monitor.sh
```

### View Logs
```bash
# Backend logs
tail -f logs/backend-error.log
tail -f logs/backend-out.log

# Frontend logs
tail -f logs/frontend-error.log
tail -f logs/frontend-out.log

# MongoDB logs
tail -f logs/mongod.log
```

### Create Backup
```bash
./backup.sh
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   # Start MongoDB
   mongod --fork --logpath logs/mongod.log
   ```

3. **Permission denied**
   ```bash
   # Fix file permissions
   chmod +x *.sh
   ```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes are created
2. **Caching**: Implement Redis for session and data caching
3. **CDN**: Use CDN for static assets
4. **Load Balancing**: Set up load balancer for multiple instances

## Support

For support and documentation:
- Check the logs for error details
- Review the API documentation
- Contact the development team

## License

This project is licensed under the MIT License.
EOF

print_success "Production setup completed successfully!"

echo
echo "🎉 Core 2.0 Enterprise Platform is ready for production!"
echo
echo "Next steps:"
echo "1. Update configuration files with your production values"
echo "2. Start the application: ./start-production.sh"
echo "3. Access the admin dashboard: http://localhost:3000/admin"
echo "4. Change the default admin password"
echo "5. Set up SSL/TLS certificates for production"
echo
echo "For more information, see PRODUCTION_README.md"
echo
print_success "Setup completed! 🚀" 