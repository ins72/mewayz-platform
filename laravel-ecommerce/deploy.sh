#!/bin/bash

# Laravel E-commerce Platform Deployment Script
# For Ubuntu Server with CloudPanel

set -e

echo "🚀 Starting Laravel E-commerce Platform Deployment..."

# Configuration
SERVER_IP="109.106.255.240"
SERVER_USER="root"
SERVER_PASSWORD="Voetballen10+"
DOMAIN="yourdomain.com"  # Change this to your actual domain
DB_NAME="laravel_ecommerce"
DB_USER="laravel_user"
DB_PASSWORD=$(openssl rand -base64 32)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    print_warning "sshpass not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y sshpass
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install sshpass
    else
        print_error "Please install sshpass manually for your OS"
        exit 1
    fi
fi

# Function to execute remote command
execute_remote() {
    local command="$1"
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$command"
}

# Function to copy file to remote server
copy_to_remote() {
    local local_file="$1"
    local remote_path="$2"
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$local_file" "$SERVER_USER@$SERVER_IP:$remote_path"
}

print_status "Connecting to server and updating system packages..."
execute_remote "apt update && apt upgrade -y"

print_status "Installing required dependencies..."
execute_remote "apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-pgsql php8.2-sqlite3 php8.2-bcmath php8.2-curl php8.2-dom php8.2-gd php8.2-intl php8.2-mbstring php8.2-xml php8.2-zip php8.2-redis php8.2-memcached"

print_status "Installing Composer..."
execute_remote "curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer && chmod +x /usr/local/bin/composer"

print_status "Installing Node.js..."
execute_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs"

print_status "Installing Git..."
execute_remote "apt install -y git"

print_status "Installing Redis and Memcached..."
execute_remote "apt install -y redis-server memcached && systemctl enable redis-server memcached && systemctl start redis-server memcached"

print_status "Configuring PHP..."
execute_remote "sed -i 's/memory_limit = .*/memory_limit = 512M/' /etc/php/8.2/fpm/php.ini"
execute_remote "sed -i 's/upload_max_filesize = .*/upload_max_filesize = 64M/' /etc/php/8.2/fpm/php.ini"
execute_remote "sed -i 's/post_max_size = .*/post_max_size = 64M/' /etc/php/8.2/fpm/php.ini"
execute_remote "sed -i 's/max_execution_time = .*/max_execution_time = 300/' /etc/php/8.2/fpm/php.ini"
execute_remote "sed -i 's/max_input_vars = .*/max_input_vars = 3000/' /etc/php/8.2/fpm/php.ini"

print_status "Restarting PHP-FPM..."
execute_remote "systemctl restart php8.2-fpm"

print_status "Creating website directory..."
execute_remote "mkdir -p /home/cloudpanel/htdocs/$DOMAIN"

print_status "Setting proper permissions..."
execute_remote "chown -R cloudpanel:cloudpanel /home/cloudpanel/htdocs/$DOMAIN"

print_status "Copying application files..."
# Create a temporary archive of the current directory
tar -czf laravel-app.tar.gz --exclude='.git' --exclude='node_modules' --exclude='vendor' .

# Copy to server
copy_to_remote "laravel-app.tar.gz" "/home/cloudpanel/htdocs/$DOMAIN/"

# Extract on server
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && tar -xzf laravel-app.tar.gz && rm laravel-app.tar.gz"

print_status "Installing PHP dependencies..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && composer install --no-dev --optimize-autoloader"

print_status "Installing Node.js dependencies and building assets..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && npm install && npm run build"

print_status "Setting up environment file..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && cp .env.example .env"

print_status "Configuring environment variables..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/APP_ENV=local/APP_ENV=production/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's|APP_URL=.*|APP_URL=https://$DOMAIN|' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/DB_HOST=.*/DB_HOST=localhost/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/DB_USERNAME=.*/DB_USERNAME=$DB_USER/' .env"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/' .env"

print_status "Setting proper file permissions..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && chmod -R 755 . && chmod -R 775 storage bootstrap/cache"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && chown -R www-data:www-data storage bootstrap/cache"
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && chmod 600 .env"

print_status "Generating application key..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && php artisan key:generate"

print_status "Running database migrations..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && php artisan migrate --force"

print_status "Seeding sample data..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && php artisan db:seed --class=SampleDataSeeder --force"

print_status "Optimizing application..."
execute_remote "cd /home/cloudpanel/htdocs/$DOMAIN && php artisan config:cache && php artisan route:cache && php artisan view:cache"

print_status "Setting up queue worker service..."
execute_remote "cat > /etc/systemd/system/laravel-queue.service << 'EOF'
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
Type=simple
User=cloudpanel
Group=cloudpanel
Restart=always
WorkingDirectory=/home/cloudpanel/htdocs/$DOMAIN
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"

print_status "Enabling and starting queue worker..."
execute_remote "systemctl enable laravel-queue && systemctl start laravel-queue"

print_status "Configuring firewall..."
execute_remote "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable"

print_status "Setting up backup script..."
execute_remote "cat > /root/backup-laravel.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=\"/backups/laravel\"
DATE=\$(date +%Y%m%d_%H%M%S)
SITE_DIR=\"/home/cloudpanel/htdocs/$DOMAIN\"

mkdir -p \$BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz \$SITE_DIR

find \$BACKUP_DIR -name \"*.sql\" -mtime +7 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +7 -delete

echo \"Backup completed: \$DATE\"
EOF"

execute_remote "chmod +x /root/backup-laravel.sh"

print_status "Setting up daily backups..."
execute_remote "echo '0 2 * * * /root/backup-laravel.sh' | crontab -"

print_status "Cleaning up temporary files..."
rm -f laravel-app.tar.gz

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Access CloudPanel at: http://$SERVER_IP:8443"
echo "2. Create a new website with domain: $DOMAIN"
echo "3. Set document root to: /home/cloudpanel/htdocs/$DOMAIN/public"
echo "4. Create database: $DB_NAME"
echo "5. Update .env file with your database credentials"
echo "6. Enable SSL certificate in CloudPanel"
echo ""
echo "🔑 Database credentials:"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🌐 Your e-commerce site will be available at: https://$DOMAIN"
echo ""
echo "📱 Test accounts:"
echo "   Admin: admin@example.com / password"
echo "   User: user@example.com / password"
echo ""
echo "📞 If you need help, check the DEPLOYMENT_GUIDE.md file"