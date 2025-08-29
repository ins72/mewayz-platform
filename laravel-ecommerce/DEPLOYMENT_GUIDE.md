# Laravel E-commerce Platform Deployment Guide

## 🚀 Deployment to Ubuntu Server with CloudPanel

This guide will walk you through deploying your Laravel e-commerce application to your Ubuntu server at `109.106.255.240` with CloudPanel.

## 📋 Prerequisites

- Ubuntu server with CloudPanel installed
- SSH access to your server
- Domain name (optional but recommended)
- SSL certificate (CloudPanel can provide this)

## 🔧 Server Setup Commands

### 1. SSH to Your Server

```bash
ssh root@109.106.255.240
# Password: Voetballen10+
```

### 2. Update System Packages

```bash
apt update && apt upgrade -y
```

### 3. Install Required Dependencies

```bash
# Install PHP 8.2 and extensions
apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-pgsql php8.2-sqlite3 \
php8.2-bcmath php8.2-curl php8.2-dom php8.2-gd php8.2-intl php8.2-mbstring \
php8.2-xml php8.2-zip php8.2-redis php8.2-memcached

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Node.js and npm (for asset compilation)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Git
apt install -y git
```

### 4. Configure PHP

```bash
# Edit PHP configuration
nano /etc/php/8.2/fpm/php.ini

# Set these values:
memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 3000

# Restart PHP-FPM
systemctl restart php8.2-fpm
```

## 🌐 CloudPanel Setup

### 1. Access CloudPanel

- Open your browser and go to `http://109.106.255.240:8443`
- Login with your CloudPanel credentials

### 2. Create a New Website

1. Click "Add Website"
2. Enter your domain name (or use IP for testing)
3. Select PHP 8.2
4. Enable SSL certificate
5. Set document root to `/home/cloudpanel/htdocs/yourdomain.com/public`

### 3. Create Database

1. Go to "Databases" section
2. Click "Add Database"
3. Note down:
   - Database name
   - Username
   - Password
   - Host (usually localhost)

## 📦 Application Deployment

### 1. Clone Your Application

```bash
cd /home/cloudpanel/htdocs/yourdomain.com
git clone https://github.com/yourusername/laravel-ecommerce.git .
# OR upload your files via SFTP/SCP
```

### 2. Set Permissions

```bash
# Set proper ownership
chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/yourdomain.com

# Set proper permissions
chmod -R 755 /home/cloudpanel/htdocs/yourdomain.com
chmod -R 775 /home/cloudpanel/htdocs/yourdomain.com/storage
chmod -R 775 /home/cloudpanel/htdocs/yourdomain.com/bootstrap/cache
```

### 3. Install Dependencies

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies (if using Vite/Mix)
npm install
npm run build
```

### 4. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit environment file
nano .env
```

#### Update these values in `.env`:

```env
APP_NAME="Your E-commerce Store"
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

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

PAYMENT_GATEWAY=stripe
STRIPE_KEY=your_stripe_public_key
STRIPE_SECRET=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_s3_bucket
AWS_USE_PATH_STYLE_ENDPOINT=false
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Run Database Migrations

```bash
php artisan migrate --force
```

### 7. Seed Sample Data (Optional)

```bash
php artisan db:seed --class=SampleDataSeeder --force
```

### 8. Optimize Application

```bash
# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

## 🔒 Security Configuration

### 1. Set Proper File Permissions

```bash
# Make storage and cache writable
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Make .env file secure
chmod 600 .env
```

### 2. Configure Firewall

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 3. Set Up SSL Certificate

- In CloudPanel, go to your website settings
- Enable SSL certificate
- Choose Let's Encrypt for free SSL

## 📊 Performance Optimization

### 1. Install Redis

```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

### 2. Install Memcached

```bash
apt install -y memcached
systemctl enable memcached
systemctl start memcached
```

### 3. Configure OPcache

```bash
# Edit PHP configuration
nano /etc/php/8.2/fpm/conf.d/10-opcache.ini

# Add these settings:
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.enable_cli=1
```

### 4. Set Up Queue Worker

```bash
# Create systemd service for queue worker
nano /etc/systemd/system/laravel-queue.service
```

Add this content:

```ini
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
Type=simple
User=cloudpanel
Group=cloudpanel
Restart=always
WorkingDirectory=/home/cloudpanel/htdocs/yourdomain.com
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
systemctl enable laravel-queue
systemctl start laravel-queue
```

## 🚀 Final Steps

### 1. Test Your Application

- Visit your domain in a browser
- Test the main functionality
- Check for any errors in the logs

### 2. Set Up Monitoring

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Check application logs
tail -f storage/logs/laravel.log
```

### 3. Set Up Backups

```bash
# Create backup script
nano /root/backup-laravel.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/backups/laravel"
DATE=$(date +%Y%m%d_%H%M%S)
SITE_DIR="/home/cloudpanel/htdocs/yourdomain.com"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u your_db_user -p your_db_name > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz $SITE_DIR

# Keep only last 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
chmod +x /root/backup-laravel.sh

# Add to crontab for daily backups
crontab -e
# Add this line:
0 2 * * * /root/backup-laravel.sh
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Permission Denied Errors

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

#### 2. Database Connection Issues

- Check database credentials in `.env`
- Ensure database server is running
- Verify database user permissions

#### 3. 500 Internal Server Error

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check PHP-FPM logs
tail -f /var/log/php8.2-fpm.log

# Check web server logs
tail -f /var/log/nginx/error.log
```

#### 4. Slow Performance

- Enable OPcache
- Use Redis for caching
- Optimize database queries
- Enable queue workers

## 📱 Mobile App Considerations

If you plan to create mobile apps later:

### 1. API Endpoints

Your Laravel application already includes API routes for:
- Product search
- Cart management
- Order processing

### 2. API Authentication

Consider implementing:
- JWT tokens for mobile app authentication
- API rate limiting
- Mobile-specific endpoints

### 3. Push Notifications

Plan for:
- Order status updates
- Promotional notifications
- Abandoned cart reminders

## 🎯 Next Steps

After successful deployment:

1. **Test all functionality** thoroughly
2. **Set up monitoring** and alerting
3. **Configure backups** and disaster recovery
4. **Set up CI/CD** pipeline for future updates
5. **Implement analytics** and tracking
6. **Set up customer support** system
7. **Plan for scaling** as your business grows

## 📞 Support

If you encounter any issues during deployment:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Check system logs: `/var/log/syslog`
3. Check PHP-FPM logs: `/var/log/php8.2-fpm.log`
4. Check web server logs: `/var/log/nginx/error.log`

## 🎉 Congratulations!

You now have a fully functional Laravel e-commerce platform deployed on your Ubuntu server with CloudPanel. The platform includes:

- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ User authentication and profiles
- ✅ Order management system
- ✅ Review and rating system
- ✅ Wishlist functionality
- ✅ Admin panel for management
- ✅ Responsive design
- ✅ API endpoints for mobile apps

Your e-commerce store is ready to start selling products!