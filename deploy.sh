#!/bin/bash

# MIS Addimiyati - Digital Ocean Deployment Script
# Run this script as root on your Digital Ocean droplet

set -e

echo "🏫 MIS Addimiyati - Digital Ocean Deployment"
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-cli php8.1-curl php8.1-xml php8.1-zip php8.1-gd php8.1-mbstring php8.1-bcmath php8.1-intl unzip git

# Install Composer
echo "📦 Installing Composer..."
if [ ! -f /usr/local/bin/composer ]; then
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
fi

# Install Node.js and npm (for asset compilation)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Create project directory
echo "📁 Setting up project directory..."
cd /var/www/html

# Clone repository (you may need to provide SSH key or use HTTPS)
echo "📥 Cloning repository..."
if [ ! -d "project-marlina" ]; then
    echo "⚠️  Please clone your repository manually:"
    echo "   git clone https://github.com/FaizFaisalHafidz/marlina.git project-marlina"
    echo "   Then run this script again."
    exit 1
fi

cd project-marlina

# Set ownership
chown -R www-data:www-data /var/www/html/project-marlina

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
sudo -u www-data composer install --optimize-autoloader --no-dev

# Install Node dependencies and build assets
echo "🎨 Building frontend assets..."
sudo -u www-data npm install
sudo -u www-data npm run build

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from example"
    echo "⚠️  Please edit .env file with your production settings:"
    echo "   - Database credentials"
    echo "   - APP_URL"
    echo "   - Wablas API credentials"
    echo "   - Set APP_ENV=production"
    echo "   - Set APP_DEBUG=false"
fi

# Generate application key
echo "🔑 Generating application key..."
sudo -u www-data php artisan key:generate --force

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/html/project-marlina
chmod -R 755 /var/www/html/project-marlina
chmod -R 775 /var/www/html/project-marlina/storage
chmod -R 775 /var/www/html/project-marlina/bootstrap/cache

# Create Nginx configuration
echo "🌐 Setting up Nginx..."
cat > /etc/nginx/sites-available/marlina << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html/project-marlina/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/marlina /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Setup database (interactive)
echo "🗄️  Setting up database..."
echo "Please run the following MySQL commands manually:"
echo "sudo mysql -u root -p"
echo ""
echo "CREATE DATABASE db_marlina_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER 'marlina_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';"
echo "GRANT ALL PRIVILEGES ON db_marlina_prod.* TO 'marlina_user'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo ""
echo "Press Enter when done..."
read

# Run migrations (after database is set up)
echo "🗄️  Running database migrations..."
sudo -u www-data php artisan migrate --force

# Cache configuration
echo "⚡ Caching configuration..."
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Setup cron job
echo "⏰ Setting up cron job..."
(crontab -u www-data -l 2>/dev/null; echo "* * * * * cd /var/www/html/project-marlina && php artisan schedule:run >> /dev/null 2>&1") | crontab -u www-data -

# Start services
echo "🚀 Starting services..."
systemctl enable nginx
systemctl enable php8.1-fpm
systemctl enable mysql
systemctl enable cron

systemctl start nginx
systemctl start php8.1-fpm
systemctl start mysql
systemctl start cron

# Reload Nginx
systemctl reload nginx

# Test setup
echo "🧪 Testing installation..."
sudo -u www-data php artisan timezone:test
sudo -u www-data php artisan system:health-check

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /var/www/html/project-marlina/.env with production settings"
echo "2. Configure your domain name in Nginx"
echo "3. Setup SSL certificate with: sudo certbot --nginx"
echo "4. Test WhatsApp integration: sudo -u www-data php artisan reminder:send-monthly --test"
echo ""
echo "📊 Monitor logs:"
echo "- Laravel: tail -f /var/www/html/project-marlina/storage/logs/laravel.log"
echo "- Nginx: tail -f /var/log/nginx/error.log"
echo "- PHP-FPM: tail -f /var/log/php8.1-fpm.log"
echo ""
echo "🏫 MIS Addimiyati system is ready!"
