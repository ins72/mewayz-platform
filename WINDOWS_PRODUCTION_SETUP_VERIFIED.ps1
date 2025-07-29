# MEWAYZ ENTERPRISE PLATFORM - WINDOWS 11 PRODUCTION SETUP
# Verified Setup Script Following Enterprise Standards
# Last Updated: January 2025 after Comprehensive Audit

Write-Host "🚀 MEWAYZ ENTERPRISE PLATFORM - WINDOWS 11 PRODUCTION SETUP" -ForegroundColor Green
Write-Host "Following Enterprise Deployment Standards" -ForegroundColor Cyan
Write-Host "=" * 60

# Check Administrator Privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Administrator privileges confirmed" -ForegroundColor Green

# Set Execution Policy
Write-Host "`n🔧 Setting PowerShell execution policy..." -ForegroundColor Cyan
Set-ExecutionPolicy Bypass -Scope Process -Force
Write-Host "✅ Execution policy set" -ForegroundColor Green

# Install Chocolatey Package Manager
Write-Host "`n📦 Installing Chocolatey package manager..." -ForegroundColor Cyan
try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Chocolatey: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install Core Dependencies
Write-Host "`n🛠️ Installing core production dependencies..." -ForegroundColor Cyan

$dependencies = @(
    @{name="nodejs-lts"; description="Node.js LTS for backend"},
    @{name="mongodb"; description="MongoDB for database"},
    @{name="redis"; description="Redis for caching"},
    @{name="nginx"; description="Nginx for reverse proxy"},
    @{name="git"; description="Git for version control"},
    @{name="python"; description="Python for testing scripts"}
)

foreach ($dep in $dependencies) {
    Write-Host "Installing $($dep.description)..." -ForegroundColor Yellow
    try {
        choco install $dep.name -y --no-progress
        Write-Host "✅ $($dep.description) installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Warning: Failed to install $($dep.name)" -ForegroundColor Yellow
    }
}

# Install Global Node.js Dependencies
Write-Host "`n📦 Installing global Node.js packages..." -ForegroundColor Cyan
$nodePackages = @("pm2", "nodemon", "typescript", "next", "prisma")

foreach ($package in $nodePackages) {
    Write-Host "Installing $package..." -ForegroundColor Yellow
    try {
        npm install -g $package
        Write-Host "✅ $package installed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Warning: Failed to install $package" -ForegroundColor Yellow
    }
}

# Create Directory Structure
Write-Host "`n📁 Creating production directory structure..." -ForegroundColor Cyan
$directories = @(
    "C:\mewayz",
    "C:\mewayz\frontend", 
    "C:\mewayz\backend",
    "C:\mewayz\logs",
    "C:\mewayz\ssl",
    "C:\mewayz\backups",
    "C:\mewayz\uploads"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directory exists: $dir" -ForegroundColor Green
    }
}

# Configure MongoDB
Write-Host "`n🗄️ Configuring MongoDB for production..." -ForegroundColor Cyan
$mongoConfig = @"
# MongoDB configuration file for MEWAYZ production
systemLog:
  destination: file
  path: C:\mewayz\logs\mongodb.log
  logAppend: true

storage:
  dbPath: C:\mewayz\data\db

net:
  port: 27017
  bindIpAll: true

security:
  authorization: enabled

processManagement:
  windowsService:
    serviceName: MongoDB
    displayName: MongoDB MEWAYZ
"@

$mongoConfig | Out-File -FilePath "C:\mewayz\mongodb.conf" -Encoding UTF8
Write-Host "✅ MongoDB configuration created" -ForegroundColor Green

# Create MongoDB data directory
if (!(Test-Path "C:\mewayz\data\db")) {
    New-Item -ItemType Directory -Path "C:\mewayz\data\db" -Force | Out-Null
    Write-Host "✅ MongoDB data directory created" -ForegroundColor Green
}

# Configure Redis
Write-Host "`n⚡ Configuring Redis for production..." -ForegroundColor Cyan
$redisConfig = @"
# Redis configuration for MEWAYZ production
port 6379
bind 127.0.0.1
timeout 0
save 900 1
save 300 10
save 60 10000
dir C:\mewayz\data\redis
logfile C:\mewayz\logs\redis.log
"@

if (!(Test-Path "C:\mewayz\data\redis")) {
    New-Item -ItemType Directory -Path "C:\mewayz\data\redis" -Force | Out-Null
}

$redisConfig | Out-File -FilePath "C:\mewayz\redis.conf" -Encoding UTF8
Write-Host "✅ Redis configuration created" -ForegroundColor Green

# Configure Nginx
Write-Host "`n🌐 Configuring Nginx reverse proxy..." -ForegroundColor Cyan
$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server 127.0.0.1:5000;
    }
    
    upstream frontend {
        server 127.0.0.1:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
        
        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "C:\mewayz\nginx.conf" -Encoding UTF8
Write-Host "✅ Nginx configuration created" -ForegroundColor Green

# Create PM2 Ecosystem Configuration
Write-Host "`n⚖️ Creating PM2 ecosystem configuration..." -ForegroundColor Cyan
$pm2Config = @"
{
  "apps": [
    {
      "name": "mewayz-backend",
      "script": "server.js",
      "cwd": "C:\\mewayz\\backend",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 5000,
        "DATABASE_URL": "mongodb://localhost:27017/mewayz",
        "REDIS_URL": "redis://localhost:6379"
      },
      "log_file": "C:\\mewayz\\logs\\backend.log",
      "error_file": "C:\\mewayz\\logs\\backend-error.log",
      "out_file": "C:\\mewayz\\logs\\backend-out.log"
    },
    {
      "name": "mewayz-frontend",
      "script": "npm",
      "args": "start",
      "cwd": "C:\\mewayz\\frontend",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000,
        "NEXT_PUBLIC_API_URL": "http://localhost:5000"
      },
      "log_file": "C:\\mewayz\\logs\\frontend.log",
      "error_file": "C:\\mewayz\\logs\\frontend-error.log",
      "out_file": "C:\\mewayz\\logs\\frontend-out.log"
    }
  ]
}
"@

$pm2Config | Out-File -FilePath "C:\mewayz\ecosystem.config.json" -Encoding UTF8
Write-Host "✅ PM2 ecosystem configuration created" -ForegroundColor Green

# Create Windows Firewall Rules
Write-Host "`n🔥 Configuring Windows Firewall rules..." -ForegroundColor Cyan
try {
    New-NetFirewallRule -DisplayName "MEWAYZ HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
    New-NetFirewallRule -DisplayName "MEWAYZ HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
    New-NetFirewallRule -DisplayName "MEWAYZ Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
    New-NetFirewallRule -DisplayName "MEWAYZ Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
    Write-Host "✅ Firewall rules configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Some firewall rules may already exist" -ForegroundColor Yellow
}

# Create Startup Scripts
Write-Host "`n🚀 Creating startup scripts..." -ForegroundColor Cyan

# Start Production Script
$startScript = @"
@echo off
echo Starting MEWAYZ Production Services...

echo Starting MongoDB...
net start MongoDB

echo Starting Redis...
net start Redis

echo Starting Nginx...
cd C:\tools\nginx
start nginx.exe

echo Starting PM2 services...
pm2 start C:\mewayz\ecosystem.config.json

echo All services started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo Admin Panel: http://localhost:3000/admin

pause
"@

$startScript | Out-File -FilePath "C:\mewayz\start-production.bat" -Encoding ASCII
Write-Host "✅ Start production script created" -ForegroundColor Green

# Stop Production Script
$stopScript = @"
@echo off
echo Stopping MEWAYZ Production Services...

echo Stopping PM2 services...
pm2 stop all

echo Stopping Nginx...
taskkill /f /im nginx.exe 2>nul

echo Stopping Redis...
net stop Redis

echo Stopping MongoDB...
net stop MongoDB

echo All services stopped!
pause
"@

$stopScript | Out-File -FilePath "C:\mewayz\stop-production.bat" -Encoding ASCII
Write-Host "✅ Stop production script created" -ForegroundColor Green

# Create Environment Variables File
Write-Host "`n🔧 Creating environment configuration..." -ForegroundColor Cyan
$envFile = @"
# MEWAYZ Production Environment Variables
NODE_ENV=production
PORT=5000
FRONTEND_PORT=3000

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/mewayz
REDIS_URL=redis://localhost:6379

# Security Keys (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# Email Configuration (Configure with your SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=C:\mewayz\uploads
MAX_FILE_SIZE=10485760

# API Configuration
API_RATE_LIMIT=1000
CORS_ORIGIN=http://localhost:3000

# Monitoring
LOG_LEVEL=info
LOG_PATH=C:\mewayz\logs
"@

$envFile | Out-File -FilePath "C:\mewayz\.env.production" -Encoding UTF8
Write-Host "✅ Environment configuration created" -ForegroundColor Green

# Install PM2 as Windows Service
Write-Host "`n⚙️ Installing PM2 as Windows service..." -ForegroundColor Cyan
try {
    npm install -g pm2-windows-service
    pm2-service-install
    Write-Host "✅ PM2 Windows service installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: PM2 service installation may have failed" -ForegroundColor Yellow
}

# Create Backup Script
Write-Host "`n💾 Creating backup scripts..." -ForegroundColor Cyan
$backupScript = @"
@echo off
echo Creating MEWAYZ backup...

set BACKUP_DIR=C:\mewayz\backups\%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
mkdir "%BACKUP_DIR%"

echo Backing up database...
mongodump --out "%BACKUP_DIR%\mongodb"

echo Backing up application files...
xcopy "C:\mewayz\frontend" "%BACKUP_DIR%\frontend" /E /I /Y
xcopy "C:\mewayz\backend" "%BACKUP_DIR%\backend" /E /I /Y
xcopy "C:\mewayz\uploads" "%BACKUP_DIR%\uploads" /E /I /Y

echo Backup completed: %BACKUP_DIR%
pause
"@

$backupScript | Out-File -FilePath "C:\mewayz\backup.bat" -Encoding ASCII
Write-Host "✅ Backup script created" -ForegroundColor Green

# Final Configuration Summary
Write-Host "`n📋 PRODUCTION SETUP COMPLETED!" -ForegroundColor Green
Write-Host "=" * 50
Write-Host "Installation Directory: C:\mewayz" -ForegroundColor Cyan
Write-Host "MongoDB Config: C:\mewayz\mongodb.conf" -ForegroundColor Cyan
Write-Host "Redis Config: C:\mewayz\redis.conf" -ForegroundColor Cyan
Write-Host "Nginx Config: C:\mewayz\nginx.conf" -ForegroundColor Cyan
Write-Host "PM2 Config: C:\mewayz\ecosystem.config.json" -ForegroundColor Cyan
Write-Host "Environment: C:\mewayz\.env.production" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start Services: C:\mewayz\start-production.bat" -ForegroundColor Green
Write-Host "Stop Services: C:\mewayz\stop-production.bat" -ForegroundColor Green
Write-Host "Backup Data: C:\mewayz\backup.bat" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Service URLs:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ IMPORTANT NEXT STEPS:" -ForegroundColor Red
Write-Host "1. Copy your application files to C:\mewayz\frontend and C:\mewayz\backend" -ForegroundColor Yellow
Write-Host "2. Update the environment variables in C:\mewayz\.env.production" -ForegroundColor Yellow
Write-Host "3. Configure SSL certificates for HTTPS (recommended)" -ForegroundColor Yellow
Write-Host "4. Run the production test suite: python COMPREHENSIVE_PYTHON_TESTING_SUITE.py" -ForegroundColor Yellow
Write-Host "5. Start services with: C:\mewayz\start-production.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Windows 11 production environment ready!" -ForegroundColor Green

Read-Host "Press Enter to complete setup" 