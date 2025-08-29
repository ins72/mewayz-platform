# 🚀 Laravel Ecommerce Platform - CloudPanel Deployment Guide

## 📋 Prerequisites

Before deploying to your CloudPanel server, ensure you have:
- ✅ CloudPanel installed and configured on Ubuntu
- ✅ Domain name pointed to your server
- ✅ SSH access to your server
- ✅ Basic knowledge of Linux commands

## 🖥️ Server Information
- **IP Address**: 109.106.255.240
- **Username**: root
- **Password**: Voetballen10+
- **Panel**: CloudPanel

## 🔧 Step 1: Server Preparation

### 1.1 Connect to Your Server
```bash
ssh root@109.106.255.240
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Required Software
```bash
# Install PHP 8.2 and extensions
apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-zip php8.2-curl php8.2-gd php8.2-bcmath php8.2-intl php8.2-soap php8.2-redis

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Install Node.js and NPM
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Redis
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

## 🌐 Step 2: CloudPanel Configuration

### 2.1 Access CloudPanel
1. Open your browser and go to: `http://109.106.255.240:8443`
2. Login with your CloudPanel credentials
3. Create a new site for your ecommerce platform

### 2.2 Create New Site
1. Click "Sites" → "Add Site"
2. Fill in the following details:
   - **Domain**: Your domain name (e.g., `yourdomain.com`)
   - **PHP Version**: 8.2
   - **Database**: Create new MySQL database
   - **SSL**: Enable Let's Encrypt SSL

### 2.3 Configure PHP Settings
1. Go to "Sites" → Your Site → "PHP Settings"
2. Update the following values:
   ```ini
   memory_limit = 512M
   max_execution_time = 300
   upload_max_filesize = 64M
   post_max_size = 64M
   ```

## 📁 Step 3: Deploy Laravel Application

### 3.1 Upload Application Files
```bash
# Navigate to your site directory
cd /home/cloudpanel/htdocs/yourdomain.com

# Remove default files
rm -rf *

# Clone or upload your Laravel project
# Option 1: Clone from Git (if you have a repository)
git clone https://github.com/yourusername/laravel-ecommerce.git .

# Option 2: Upload via SCP/SFTP
# Use FileZilla or similar to upload files
```

### 3.2 Set Proper Permissions
```bash
# Set ownership
chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/yourdomain.com

# Set directory permissions
find /home/cloudpanel/htdocs/yourdomain.com -type d -exec chmod 755 {} \;

# Set file permissions
find /home/cloudpanel/htdocs/yourdomain.com -type f -exec chmod 644 {} \;

# Set special permissions for storage and bootstrap/cache
chmod -R 775 storage bootstrap/cache
chown -R cloudpanel:cloudpanel storage bootstrap/cache
```

### 3.3 Install Dependencies
```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
npm install
npm run build
```

## 🗄️ Step 4: Database Configuration

### 4.1 Update Environment File
```bash
# Copy environment file
cp .env.example .env

# Edit environment file
nano .env
```

### 4.2 Configure Database Settings
```ini
APP_NAME="Your Ecommerce Store"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4.3 Generate Application Key
```bash
php artisan key:generate
```

### 4.4 Run Database Migrations
```bash
php artisan migrate --force
php artisan db:seed --force
```

## 🔐 Step 5: Security Configuration

### 5.1 Configure File Permissions
```bash
# Set proper permissions for security
chmod 644 .env
chmod 644 storage/logs/laravel.log
```

### 5.2 Configure Web Server
```bash
# Create .htaccess file in public directory
cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF
```

### 5.3 Configure Caching
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🚀 Step 6: Final Configuration

### 6.1 Create Cron Job
```bash
# Edit crontab
crontab -e

# Add Laravel scheduler
* * * * * cd /home/cloudpanel/htdocs/yourdomain.com && php artisan schedule:run >> /dev/null 2>&1
```

### 6.2 Configure Queue Worker (Optional)
```bash
# Create systemd service for queue worker
cat > /etc/systemd/system/laravel-queue.service << 'EOF'
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
Type=simple
User=cloudpanel
Group=cloudpanel
WorkingDirectory=/home/cloudpanel/htdocs/yourdomain.com
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl enable laravel-queue
systemctl start laravel-queue
```

### 6.3 Test Application
```bash
# Test if everything works
php artisan route:list
php artisan config:clear
php artisan cache:clear
```

## 🔍 Step 7: Testing & Verification

### 7.1 Test Website
1. Visit your domain: `https://yourdomain.com`
2. Check if the homepage loads correctly
3. Test product browsing functionality
4. Test cart functionality
5. Test user registration/login

### 7.2 Check Logs
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check PHP error logs
tail -f /var/log/php8.2-fpm.log
```

### 7.3 Performance Optimization
```bash
# Install OPcache
apt install -y php8.2-opcache

# Configure OPcache in php.ini
echo "opcache.enable=1" >> /etc/php/8.2/fpm/php.ini
echo "opcache.memory_consumption=128" >> /etc/php/8.2/fpm/php.ini
echo "opcache.interned_strings_buffer=8" >> /etc/php/8.2/fpm/php.ini
echo "opcache.max_accelerated_files=4000" >> /etc/php/8.2/fpm/php.ini

# Restart PHP-FPM
systemctl restart php8.2-fpm
```

## 🛠️ Step 8: Maintenance Commands

### 8.1 Regular Maintenance
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check application status
php artisan about
```

### 8.2 Backup Commands
```bash
# Backup database
mysqldump -u your_user -p your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /home/cloudpanel/htdocs/yourdomain.com
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Issue: 500 Internal Server Error
```bash
# Check permissions
chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/yourdomain.com
chmod -R 755 /home/cloudpanel/htdocs/yourdomain.com
chmod -R 775 storage bootstrap/cache

# Check logs
tail -f storage/logs/laravel.log
```

#### Issue: Database Connection Error
```bash
# Test database connection
php artisan tinker
DB::connection()->getPdo();

# Check .env file
cat .env | grep DB_
```

#### Issue: Page Not Found (404)
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache

# Check if mod_rewrite is enabled
a2enmod rewrite
systemctl restart apache2
```

## 📞 Support

If you encounter any issues during deployment:

1. **Check Logs**: Always check Laravel and server logs first
2. **Verify Permissions**: Ensure proper file and directory permissions
3. **Test Database**: Verify database connection and credentials
4. **Check Configuration**: Ensure all environment variables are set correctly

## 🎯 Next Steps

After successful deployment:

1. **Add Products**: Use the admin panel to add your products
2. **Configure Payment**: Set up payment gateways (Stripe, PayPal, etc.)
3. **Set Up Email**: Configure email services for order notifications
4. **Monitor Performance**: Set up monitoring and analytics
5. **Regular Updates**: Keep Laravel and dependencies updated

---

**🎉 Congratulations! Your Laravel Ecommerce Platform is now deployed and ready for production use.**

For additional features and customization, refer to the Laravel documentation and explore the admin panel functionality.