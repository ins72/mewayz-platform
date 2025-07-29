# MEWAYZ Windows 11 Production Deployment Script
# Complete Enterprise Setup for Single Windows Device
# Following req.md specifications for Windows single-device deployment

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

Write-Host "🚀 MEWAYZ Windows 11 Production Deployment Starting..." -ForegroundColor Green
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
    if ($totalRAM -lt 32) {
        Write-Host "⚠️  Warning: Less than 32GB RAM detected. Performance may be limited." -ForegroundColor Yellow
    }
    
    if ($processorCores -lt 8) {
        Write-Host "⚠️  Warning: Less than 8 CPU cores detected. Performance may be limited." -ForegroundColor Yellow
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
        "curl"
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

    # Step 6: Configure MongoDB
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

    # Step 7: Configure PostgreSQL
    Write-Step "Configuring PostgreSQL"
    
    $pgDataPath = "C:\mewayz\database\postgresql"
    if (-not (Test-Path $pgDataPath)) {
        New-Item -Path $pgDataPath -ItemType Directory -Force | Out-Null
        Write-Host "Initializing PostgreSQL database..." -ForegroundColor Yellow
        & "C:\Program Files\PostgreSQL\15\bin\initdb.exe" -D $pgDataPath -U postgres --pwprompt
    }

    # Step 8: Configure Redis
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

    # Step 9: Configure Nginx
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

    # Step 10: SSL Certificate Setup
    Write-Step "Setting up SSL Certificates"
    
    if (-not $SkipSSL) {
        $sslPath = "C:\ssl\mewayz"
        if (-not (Test-Path $sslPath)) {
            New-Item -Path $sslPath -ItemType Directory -Force | Out-Null
        }
        
        # Generate self-signed certificate for development
        if ($Development) {
            Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Yellow
            & openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$sslPath\mewayz.key" -out "$sslPath\mewayz.crt" -subj "/C=US/ST=State/L=City/O=MEWAYZ/CN=$Domain"
        } else {
            Write-Host "⚠️  For production, please install proper SSL certificates in: $sslPath" -ForegroundColor Yellow
        }
    }

    # Step 11: Security Hardening
    Write-Step "Applying Security Hardening"
    
    # Windows Firewall Rules
    Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "MEWAYZ HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
    New-NetFirewallRule -DisplayName "MEWAYZ HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
    New-NetFirewallRule -DisplayName "MEWAYZ API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
    
    # Disable unnecessary services
    $servicesToDisable = @("TelnetClient", "TelnetServer", "TFTP", "SNMP")
    foreach ($service in $servicesToDisable) {
        if (Get-Service -Name $service -ErrorAction SilentlyContinue) {
            Set-Service -Name $service -StartupType Disabled
            Write-Host "Disabled service: $service" -ForegroundColor Green
        }
    }

    # Step 12: Performance Optimization
    Write-Step "Applying Performance Optimization"
    
    # Network optimization
    netsh int tcp set global autotuninglevel=normal
    netsh int tcp set global chimney=enabled
    netsh int tcp set global ecncapability=enabled
    
    # Memory optimization
    $pageFile = Get-WmiObject -Class Win32_ComputerSystem
    if ($pageFile.AutomaticManagedPagefile) {
        Write-Host "Configuring page file for optimal performance..." -ForegroundColor Yellow
        $pageFile.AutomaticManagedPagefile = $false
        $pageFile.Put()
    }

    # Step 13: Create PM2 Ecosystem Configuration
    Write-Step "Creating PM2 Ecosystem Configuration"
    
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

    # Step 14: Create Startup Scripts
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

    # Step 15: Create Monitoring Scripts
    Write-Step "Creating Monitoring Scripts"
    
    $monitoringScript = @"
@echo off
echo MEWAYZ Production Monitoring
echo ===========================
echo.

echo Checking Services Status:
echo -------------------------
echo MongoDB: 
sc query MongoDB | find "STATE"
echo.

echo PostgreSQL:
sc query postgresql-x64-15 | find "STATE"
echo.

echo Redis:
tasklist | find "redis-server.exe"
echo.

echo Nginx:
tasklist | find "nginx.exe"
echo.

echo PM2 Processes:
pm2 list
echo.

echo System Resources:
echo -----------------
wmic cpu get loadpercentage /value
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
echo.

echo Disk Usage:
wmic logicaldisk get size,freespace,caption
echo.

echo Network Connections:
netstat -an | find ":80\|:443\|:5000\|:27017\|:5432\|:6379"
"@
    $monitoringScript | Out-File -FilePath "C:\mewayz\monitor.bat" -Encoding ASCII

    # Step 16: Create Backup Scripts
    Write-Step "Creating Backup Scripts"
    
    $backupScript = @"
@echo off
echo Starting MEWAYZ Backup Process...
set BACKUP_DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DATE=%BACKUP_DATE: =0%
set BACKUP_DIR=C:\backups\mewayz\%BACKUP_DATE%

echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo Backing up MongoDB...
"C:\Program Files\MongoDB\Server\7.0\bin\mongodump.exe" --db mewayz_production --out "%BACKUP_DIR%\mongodb"

echo Backing up PostgreSQL...
"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -U postgres -d mewayz_production > "%BACKUP_DIR%\postgresql_backup.sql"

echo Backing up application files...
xcopy "C:\mewayz" "%BACKUP_DIR%\application" /E /I /H /Y

echo Backing up logs...
xcopy "C:\logs\mewayz" "%BACKUP_DIR%\logs" /E /I /H /Y

echo Creating backup archive...
"C:\Program Files\7-Zip\7z.exe" a -tzip "%BACKUP_DIR%.zip" "%BACKUP_DIR%\*"

echo Cleaning up temporary files...
rmdir /S /Q "%BACKUP_DIR%"

echo Backup completed: %BACKUP_DIR%.zip
"@
    $backupScript | Out-File -FilePath "C:\mewayz\backup.bat" -Encoding ASCII

    # Step 17: Final Configuration
    Write-Step "Final Configuration"
    
    Write-Host "✅ Production setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy your application files to C:\mewayz" -ForegroundColor White
    Write-Host "2. Update configuration files with your settings" -ForegroundColor White
    Write-Host "3. Install SSL certificates in C:\ssl\mewayz" -ForegroundColor White
    Write-Host "4. Run C:\mewayz\start-production.bat to start services" -ForegroundColor White
    Write-Host "5. Access your application at https://$Domain" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "- Start services: C:\mewayz\start-production.bat" -ForegroundColor White
    Write-Host "- Stop services: C:\mewayz\stop-production.bat" -ForegroundColor White
    Write-Host "- Monitor system: C:\mewayz\monitor.bat" -ForegroundColor White
    Write-Host "- Create backup: C:\mewayz\backup.bat" -ForegroundColor White
    Write-Host "- PM2 dashboard: pm2 monit" -ForegroundColor White

} catch {
    Write-Host "❌ Error during setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 