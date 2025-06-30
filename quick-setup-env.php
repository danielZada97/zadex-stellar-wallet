<?php
/**
 * Quick Environment Setup with API Key
 */

echo "=== Quick Environment Setup ===\n\n";

// Your API key
$api_key = 'cf52bc47c775435987c0c3809279c771';

// Create .env content
$env_content = "# Zadex Stellar Wallet Environment Configuration

# Database Configuration
DB_HOST=localhost
DB_NAME=zadex
DB_USER=root
DB_PASS=
DB_PORT=3306
DB_CHARSET=utf8mb4

# Exchange Rate API Configuration
EXCHANGE_RATE_API_KEY=$api_key
EXCHANGE_RATE_API_URL=http://data.fixer.io/api/latest
EXCHANGE_RATE_FALLBACK_URL=https://api.exchangerate-api.com/v4/latest

# Application Configuration
APP_NAME=Zadex Stellar Wallet
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080
APP_PORT=8080

# Backend Configuration
BACKEND_URL=http://localhost/backend/api
BACKEND_CORS_ORIGIN=http://localhost:8080

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PASSWORD_SALT=your_password_salt_here_change_this_in_production
SESSION_SECRET=your_session_secret_here_change_this_in_production

# Frontend Configuration
VITE_APP_NAME=Zadex Stellar Wallet
VITE_API_BASE_URL=http://localhost/backend/api
VITE_APP_URL=http://localhost:8080

# Development Configuration
NODE_ENV=development
VITE_DEV_SERVER_PORT=8080
VITE_DEV_SERVER_HOST=localhost

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
SMTP_ENCRYPTION=tls

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
UPLOAD_PATH=uploads/

# Cache Configuration
CACHE_DRIVER=file
CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
";

// Write .env file
if (file_put_contents('.env', $env_content)) {
    echo "✅ .env file created successfully!\n";
    echo "📁 Location: " . realpath('.env') . "\n";
    echo "🔑 API Key: $api_key (Fixer.io)\n\n";
    
    echo "🔧 Next steps:\n";
    echo "1. Test the API: Visit http://localhost:8080/test-exchange-api.html\n";
    echo "2. Update exchange rates: Click 'Update Exchange Rates'\n";
    echo "3. Test conversion: Use your comprehensive test page\n\n";
    
    echo "🚀 Your wallet will now use Fixer.io API for better exchange rates!\n";
    echo "📊 The API key will provide more accurate and up-to-date exchange rates.\n\n";
    
    echo "💡 You can now test:\n";
    echo "   - External API: Should work with Fixer.io\n";
    echo "   - Update Exchange Rates: Will use your API key\n";
    echo "   - Currency Conversion: Should work with stored rates\n";
    
} else {
    echo "❌ Failed to create .env file!\n";
    echo "Please check file permissions and try again.\n";
    exit(1);
}
?> 