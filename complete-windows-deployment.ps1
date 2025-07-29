# MEWAYZ Complete Windows Deployment Script
# Sets up everything and deploys the application to production

param(
    [Parameter(Mandatory=$false)]
    [string]$Domain = "localhost",
    
    [Parameter(Mandatory=$false)]
    [string]$PublicIP = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipSSL = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Development = $false
)

Write-Host "🚀 MEWAYZ Complete Windows Deployment Starting..." -ForegroundColor Green
Write-Host "Target Domain: $Domain" -ForegroundColor Yellow
Write-Host "Public IP: $PublicIP" -ForegroundColor Yellow
Write-Host "Skip SSL: $SkipSSL" -ForegroundColor Yellow
Write-Host "Development Mode: $Development" -ForegroundColor Yellow
Write-Host "=" * 80

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges. Please run as Administrator." -ForegroundColor Red
    exit 1
}

# Function to write step headers
function Write-Step {
    param([string]$StepName)
    Write-Host ""
    Write-Host "🔧 $StepName" -ForegroundColor Cyan
    Write-Host "-" * 60
}

# Function to check command existence
function Test-Command {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

try {
    # Step 1: System Requirements Check
    Write-Step "Checking System Requirements"
    
    $systemInfo = Get-ComputerInfo
    $totalRAM = [math]::Round($systemInfo.TotalPhysicalMemory / 1GB, 2)
    $processorCores = (Get-WmiObject -Class Win32_Processor).NumberOfCores
    
    Write-Host "System Information:" -ForegroundColor Yellow
    Write-Host "  OS: $($systemInfo.WindowsProductName)" -ForegroundColor White
    Write-Host "  Version: $($systemInfo.WindowsVersion)" -ForegroundColor White
    Write-Host "  RAM: $totalRAM GB" -ForegroundColor White
    Write-Host "  CPU Cores: $processorCores" -ForegroundColor White
    
    # Check minimum requirements
    if ($totalRAM -lt 16) {
        Write-Host "⚠️  Warning: Less than 16GB RAM detected. Performance may be limited." -ForegroundColor Yellow
    }
    
    if ($processorCores -lt 4) {
        Write-Host "⚠️  Warning: Less than 4 CPU cores detected. Performance may be limited." -ForegroundColor Yellow
    }
    
    Write-Host "✅ System requirements check completed" -ForegroundColor Green

    # Step 2: Install Chocolatey Package Manager
    Write-Step "Installing Chocolatey Package Manager"
    
    if (-not (Test-Command choco)) {
        Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        RefreshEnv.cmd
    } else {
        Write-Host "✅ Chocolatey already installed" -ForegroundColor Green
    }

    # Step 3: Install Core Dependencies
    Write-Step "Installing Core Dependencies"
    
    $dependencies = @(
        "nodejs-lts",
        "git",
        "python311",
        "redis-windows",
        "mongodb",
        "postgresql",
        "nginx",
        "openssl",
        "7zip",
        "curl",
        "chrome"
    )
    
    foreach ($dep in $dependencies) {
        if (-not (Test-Command $dep)) {
            Write-Host "Installing $dep..." -ForegroundColor Yellow
            choco install $dep -y
        } else {
            Write-Host "✅ $dep already installed" -ForegroundColor Green
        }
    }
    
    RefreshEnv.cmd

    # Step 4: Install Node.js Global Packages
    Write-Step "Installing Node.js Global Packages"
    
    $npmPackages = @(
        "pm2",
        "pm2-windows-service",
        "typescript",
        "ts-node",
        "nodemon",
        "yarn"
    )
    
    foreach ($pkg in $npmPackages) {
        Write-Host "Installing $pkg..." -ForegroundColor Yellow
        npm install -g $pkg
    }

    # Step 5: Create Directory Structure
    Write-Step "Creating Production Directory Structure"
    
    $basePath = "C:\mewayz"
    $directories = @(
        "$basePath",
        "$basePath\frontend",
        "$basePath\backend",
        "$basePath\database",
        "$basePath\logs",
        "$basePath\backups",
        "$basePath\ssl",
        "$basePath\config",
        "$basePath\scripts",
        "$basePath\monitoring",
        "C:\logs\mewayz",
        "C:\backups\mewayz",
        "C:\ssl\mewayz"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-Host "Created: $dir" -ForegroundColor Green
        }
    }

    # Step 6: Copy Application Files
    Write-Step "Copying Application Files"
    
    $currentDir = Get-Location
    $frontendSource = Join-Path $currentDir "frontend"
    $backendSource = Join-Path $currentDir "backend"
    
    if (Test-Path $frontendSource) {
        Write-Host "Copying frontend files..." -ForegroundColor Yellow
        Copy-Item -Path "$frontendSource\*" -Destination "$basePath\frontend" -Recurse -Force
        Write-Host "✅ Frontend files copied" -ForegroundColor Green
    }
    
    if (Test-Path $backendSource) {
        Write-Host "Copying backend files..." -ForegroundColor Yellow
        Copy-Item -Path "$backendSource\*" -Destination "$basePath\backend" -Recurse -Force
        Write-Host "✅ Backend files copied" -ForegroundColor Green
    }

    # Step 7: Configure Environment Files
    Write-Step "Configuring Environment Files"
    
    # Frontend environment
    $frontendEnv = @"
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$Domain/api
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=MEWAYZ Enterprise Platform
DATABASE_URL=postgresql://postgres:password@localhost:5432/mewayz_production
MONGODB_URI=mongodb://localhost:27017/mewayz_production
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@mewayz.com
FROM_NAME=MEWAYZ
"@
    $frontendEnv | Out-File -FilePath "$basePath\frontend\.env.local" -Encoding UTF8

    # Backend environment
    $backendEnv = @"
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mewayz_production
POSTGRES_URL=postgresql://postgres:password@localhost:5432/mewayz_production
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@mewayz.com
FROM_NAME=MEWAYZ
"@
    $backendEnv | Out-File -FilePath "$basePath\backend\.env" -Encoding UTF8

    # Step 8: Configure MongoDB
    Write-Step "Configuring MongoDB"
    
    $mongoConfigPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
    if (Test-Path $mongoConfigPath) {
        $mongoConfig = @"
systemLog:
  destination: file
  path: C:\logs\mewayz\mongod.log
  logAppend: true
storage:
  dbPath: C:\mewayz\database\mongodb
  journal:
    enabled: true
net:
  port: 27017
  bindIp: 127.0.0.1
security:
  authorization: enabled
"@
        $mongoConfig | Out-File -FilePath $mongoConfigPath -Encoding UTF8
        Write-Host "✅ MongoDB configuration updated" -ForegroundColor Green
    }

    # Step 9: Configure PostgreSQL
    Write-Step "Configuring PostgreSQL"
    
    $pgDataPath = "C:\mewayz\database\postgresql"
    if (-not (Test-Path $pgDataPath)) {
        New-Item -Path $pgDataPath -ItemType Directory -Force | Out-Null
        Write-Host "Initializing PostgreSQL database..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\15\bin\initdb.exe" -D $pgDataPath -U postgres --pwprompt
    }

    # Step 10: Configure Redis
    Write-Step "Configuring Redis"
    
    $redisConfigPath = "C:\mewayz\config\redis.conf"
    $redisConfig = @"
port 6379
bind 127.0.0.1
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
loglevel notice
logfile "C:\logs\mewayz\redis.log"
"@
    $redisConfig | Out-File -FilePath $redisConfigPath -Encoding UTF8

    # Step 11: Configure Nginx
    Write-Step "Configuring Nginx"
    
    $nginxConfigPath = "C:\mewayz\config\nginx.conf"
    $nginxConfig = @"
worker_processes auto;
error_log C:\logs\mewayz\nginx\error.log;
pid C:\mewayz\logs\nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log C:\logs\mewayz\nginx\access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    upstream backend {
        server 127.0.0.1:5000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name $Domain;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # Frontend static files
        location / {
            root C:\mewayz\frontend\.next;
            try_files \$uri \$uri/ /_next/static/\$uri;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # API proxy
        location /api/ {
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
        
        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
        }
    }
}
"@
    $nginxConfig | Out-File -FilePath $nginxConfigPath -Encoding UTF8

    # Step 12: Install Python Dependencies
    Write-Step "Installing Python Dependencies"
    
    Set-Location $basePath
    if (Test-Path "requirements.txt") {
        Write-Host "Installing Python requirements..." -ForegroundColor Yellow
        python -m pip install -r requirements.txt
        Write-Host "✅ Python dependencies installed" -ForegroundColor Green
    }

    # Step 13: Build Frontend
    Write-Step "Building Frontend Application"
    
    Set-Location "$basePath\frontend"
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm ci --only=production
    
    Write-Host "Building frontend application..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }

    # Step 14: Setup Database
    Write-Step "Setting up Database"
    
    Set-Location "$basePath\frontend"
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate deploy
    
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npx prisma db seed

    # Step 15: Create PM2 Ecosystem Configuration
    Write-Step "Creating PM2 Ecosystem Configuration"
    
    Set-Location $basePath
    $ecosystemConfig = @"
module.exports = {
  apps: [
    {
      name: 'mewayz-backend',
      script: 'server.js',
      cwd: 'C:\\mewayz\\backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'mongodb://localhost:27017/mewayz_production',
        POSTGRES_URL: 'postgresql://postgres:password@localhost:5432/mewayz_production',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        JWT_EXPIRE: '30d',
        COOKIE_EXPIRE: 30,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_USER: 'your-email@gmail.com',
        SMTP_PASS: 'your-app-password',
        FROM_EMAIL: 'noreply@mewayz.com',
        FROM_NAME: 'MEWAYZ'
      },
      error_file: 'C:\\logs\\mewayz\\backend-error.log',
      out_file: 'C:\\logs\\mewayz\\backend-out.log',
      log_file: 'C:\\logs\\mewayz\\backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'mewayz-frontend',
      script: 'npm',
      args: 'start',
      cwd: 'C:\\mewayz\\frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://$Domain/api'
      },
      error_file: 'C:\\logs\\mewayz\\frontend-error.log',
      out_file: 'C:\\logs\\mewayz\\frontend-out.log',
      log_file: 'C:\\logs\\mewayz\\frontend-combined.log',
      time: true
    }
  ]
};
"@
    $ecosystemConfig | Out-File -FilePath "C:\mewayz\ecosystem.config.js" -Encoding UTF8

    # Step 16: Create Startup Scripts
    Write-Step "Creating Startup Scripts"
    
    $startupScript = @"
@echo off
echo Starting MEWAYZ Production Services...

REM Start MongoDB
echo Starting MongoDB...
start /B "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"

REM Start PostgreSQL
echo Starting PostgreSQL...
start /B "PostgreSQL" "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" -D "C:\mewayz\database\postgresql" start

REM Start Redis
echo Starting Redis...
start /B "Redis" "C:\Program Files\Redis\redis-server.exe" "C:\mewayz\config\redis.conf"

REM Wait for services to start
timeout /t 10 /nobreak > nul

REM Start PM2 processes
echo Starting PM2 processes...
cd /d C:\mewayz
pm2 start ecosystem.config.js

REM Start Nginx
echo Starting Nginx...
start /B "Nginx" "C:\Program Files\nginx\nginx.exe"

echo MEWAYZ Production Services started successfully!
echo Frontend: https://$Domain
echo Backend API: https://$Domain/api
echo PM2 Dashboard: pm2 monit
"@
    $startupScript | Out-File -FilePath "C:\mewayz\start-production.bat" -Encoding ASCII

    $stopScript = @"
@echo off
echo Stopping MEWAYZ Production Services...

REM Stop PM2 processes
echo Stopping PM2 processes...
cd /d C:\mewayz
pm2 stop all
pm2 delete all

REM Stop Nginx
echo Stopping Nginx...
taskkill /f /im nginx.exe 2>nul

REM Stop Redis
echo Stopping Redis...
taskkill /f /im redis-server.exe 2>nul

REM Stop PostgreSQL
echo Stopping PostgreSQL...
"C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" -D "C:\mewayz\database\postgresql" stop

REM Stop MongoDB
echo Stopping MongoDB...
taskkill /f /im mongod.exe 2>nul

echo MEWAYZ Production Services stopped successfully!
"@
    $stopScript | Out-File -FilePath "C:\mewayz\stop-production.bat" -Encoding ASCII

    # Step 17: Run Tests
    Write-Step "Running Comprehensive Tests"
    
    Set-Location $basePath
    if (Test-Path "comprehensive_test_suite.py") {
        Write-Host "Running Python test suite..." -ForegroundColor Yellow
        python comprehensive_test_suite.py
        Write-Host "✅ Tests completed" -ForegroundColor Green
    }

    # Step 18: Start Services
    Write-Step "Starting Production Services"
    
    Write-Host "Starting all services..." -ForegroundColor Yellow
    & "C:\mewayz\start-production.bat"
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check service status
    Write-Host "Checking service status..." -ForegroundColor Yellow
    pm2 list

    # Step 19: Final Configuration
    Write-Step "Final Configuration"
    
    Write-Host "✅ Production deployment completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 MEWAYZ is now running at:" -ForegroundColor Yellow
    Write-Host "   Frontend: https://$Domain" -ForegroundColor White
    Write-Host "   Backend API: https://$Domain/api" -ForegroundColor White
    Write-Host "   PM2 Dashboard: pm2 monit" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Useful Commands:" -ForegroundColor Yellow
    Write-Host "   Start services: C:\mewayz\start-production.bat" -ForegroundColor White
    Write-Host "   Stop services: C:\mewayz\stop-production.bat" -ForegroundColor White
    Write-Host "   View logs: pm2 logs" -ForegroundColor White
    Write-Host "   Monitor: pm2 monit" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Update environment variables with your actual values" -ForegroundColor White
    Write-Host "   2. Configure SSL certificates for production" -ForegroundColor White
    Write-Host "   3. Set up monitoring and alerting" -ForegroundColor White
    Write-Host "   4. Configure backup schedules" -ForegroundColor White

} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 