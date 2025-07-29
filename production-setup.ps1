# MEWAYZ Production Setup for Windows Server
# This script sets up the complete production environment

Write-Host "🚀 MEWAYZ Production Setup Starting..." -ForegroundColor Cyan

# Step 1: Install Node.js and npm
Write-Host "📦 Installing Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    winget install OpenJS.NodeJS
}

# Step 2: Install PostgreSQL
Write-Host "🗄️ Installing PostgreSQL..." -ForegroundColor Yellow
if (-not (Get-Service postgresql* -ErrorAction SilentlyContinue)) {
    winget install PostgreSQL.PostgreSQL
}

# Step 3: Install Redis
Write-Host "📊 Installing Redis..." -ForegroundColor Yellow
winget install Redis.Redis

# Step 4: Install PM2 for process management
Write-Host "⚙️ Installing PM2..." -ForegroundColor Yellow
npm install -g pm2

# Step 5: Setup environment variables
Write-Host "🔧 Configuring environment..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://mewayz_user:secure_password@localhost:5432/mewayz_production
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secure_jwt_secret_for_production
BCRYPT_ROUNDS=12
"@

$envContent | Out-File -FilePath ".env.production" -Encoding utf8

# Step 6: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ../backend
npm install

# Step 7: Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
npx prisma migrate deploy
npx prisma generate

# Step 8: Configure PM2
Write-Host "⚙️ Configuring PM2..." -ForegroundColor Yellow
$pm2Config = @"
{
  "apps": [
    {
      "name": "mewayz-frontend",
      "script": "npm",
      "args": "start",
      "cwd": "./frontend",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3000"
      }
    },
    {
      "name": "mewayz-backend",
      "script": "server.js",
      "cwd": "./backend",
      "instances": 2,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": "8000"
      }
    }
  ]
}
"@

$pm2Config | Out-File -FilePath "ecosystem.config.json" -Encoding utf8

# Step 9: Start services
Write-Host "🚀 Starting production services..." -ForegroundColor Green
pm2 start ecosystem.config.json
pm2 save
pm2 startup

Write-Host "✅ Production setup completed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan 