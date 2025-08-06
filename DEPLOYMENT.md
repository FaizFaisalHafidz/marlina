# Deployment Guide - Digital Ocean

## 📋 Prerequisites

- Digital Ocean Droplet with PHP 8.1+, MySQL, Nginx
- Domain name configured (optional)
- SSH access to server

## 🚀 Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-cli php8.1-curl php8.1-xml php8.1-zip php8.1-gd php8.1-mbstring

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Clone and Setup Project

```bash
# Clone repository
cd /var/www/html
sudo git clone https://github.com/FaizFaisalHafidz/marlina.git project-marlina
sudo chown -R www-data:www-data project-marlina
cd project-marlina

# Install dependencies
sudo -u www-data composer install --optimize-autoloader --no-dev

# Setup environment
sudo cp .env.example .env.production
sudo nano .env.production
```

### 3. Environment Configuration (.env.production)

```env
APP_NAME="MIS Addimiyati"
APP_ENV=production
APP_KEY=base64:GENERATE_NEW_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_TIMEZONE=Asia/Jakarta

APP_LOCALE=id
APP_FALLBACK_LOCALE=en

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_marlina_prod
DB_USERNAME=marlina_user
DB_PASSWORD=SECURE_PASSWORD_HERE

# Wablas Configuration
WABLAS_BASE_URL=https://bdg.wablas.com
WABLAS_API_KEY=your_production_api_key
WABLAS_SECRET_KEY=your_production_secret
WABLAS_DEVICE_ID=your_device_id
WABLAS_WA_NUMBER=628xxxxxxxxxx

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=error
```

### 4. Database Setup

```bash
# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE db_marlina_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'marlina_user'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON db_marlina_prod.* TO 'marlina_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Run migrations
sudo -u www-data php artisan key:generate
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/marlina`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
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
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/marlina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup Cron Job

```bash
# Edit crontab for www-data user
sudo crontab -u www-data -e
```

Add this line:

```bash
# Laravel Scheduler - runs every minute
* * * * * cd /var/www/html/project-marlina && php artisan schedule:run >> /dev/null 2>&1

# Optional: Log scheduler output for debugging
# * * * * * cd /var/www/html/project-marlina && php artisan schedule:run >> /var/log/laravel-scheduler.log 2>&1
```

### 7. SSL Certificate (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. File Permissions

```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/project-marlina
sudo chmod -R 755 /var/www/html/project-marlina
sudo chmod -R 775 /var/www/html/project-marlina/storage
sudo chmod -R 775 /var/www/html/project-marlina/bootstrap/cache
```

## 🧪 Testing

### Test Timezone Configuration

```bash
cd /var/www/html/project-marlina
sudo -u www-data php artisan timezone:test
```

### Test WhatsApp Integration

```bash
# Test reminder command in test mode
sudo -u www-data php artisan reminder:send-monthly --test
```

### Test Laravel Scheduler

```bash
# Check scheduler status
sudo -u www-data php artisan schedule:list
```

## 📊 Monitoring

### Check Logs

```bash
# Laravel logs
tail -f /var/www/html/project-marlina/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PHP-FPM logs
tail -f /var/log/php8.1-fpm.log
```

### Monitor Cron Jobs

```bash
# Check if cron is running
sudo service cron status

# Check cron logs
grep CRON /var/log/syslog
```

## 🔧 Maintenance

### Update Application

```bash
cd /var/www/html/project-marlina
sudo -u www-data git pull origin main
sudo -u www-data composer install --optimize-autoloader --no-dev
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

### Database Backup

```bash
# Create backup script
sudo nano /root/backup-marlina.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u marlina_user -p db_marlina_prod > /root/backups/marlina_backup_$DATE.sql
find /root/backups -name "marlina_backup_*.sql" -mtime +7 -delete
```

```bash
# Make executable and schedule
sudo chmod +x /root/backup-marlina.sh
sudo mkdir -p /root/backups

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /root/backup-marlina.sh" | sudo crontab -
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/html/project-marlina
   sudo chmod -R 775 storage bootstrap/cache
   ```

2. **Scheduler Not Running**
   ```bash
   # Check cron service
   sudo service cron status
   sudo service cron restart
   ```

3. **WhatsApp Messages Not Sending**
   - Check Wablas API credentials
   - Verify device is connected
   - Check logs for errors

4. **Database Connection Issues**
   ```bash
   # Test MySQL connection
   mysql -u marlina_user -p db_marlina_prod
   ```

### Debug Commands

```bash
# Test scheduler manually
sudo -u www-data php artisan schedule:run -v

# Check scheduled commands
sudo -u www-data php artisan schedule:list

# Test reminder sending
sudo -u www-data php artisan reminder:send-monthly --test
```

## 📞 Support

For technical support:
- Check logs first
- Test individual components
- Contact system administrator

---

**Note:** Replace `your-domain.com`, `SECURE_PASSWORD_HERE`, and other placeholders with your actual values.
