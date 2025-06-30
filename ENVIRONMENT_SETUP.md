# Environment Setup Guide

This guide will help you set up the environment configuration for the Zadex Stellar Wallet application.

## Quick Setup

### Option 1: Interactive Setup (Recommended)

Run the interactive setup script:

```bash
php setup-env.php
```

This script will guide you through creating your `.env` file with all necessary configuration values.

### Option 2: Manual Setup

1. Copy the example file:
   ```bash
   cp env.example .env
   ```
2. Edit the `.env` file with your specific values

## Configuration Variables

### Database Configuration

```env
DB_HOST=localhost          # Database host
DB_NAME=zadex             # Database name
DB_USER=root              # Database username
DB_PASS=                  # Database password (leave empty if none)
DB_PORT=3306              # Database port
DB_CHARSET=utf8mb4        # Database character set
```

### Exchange Rate API Configuration

```env
EXCHANGE_RATE_API_KEY=your_api_key_here     # API key for exchangerate.host
EXCHANGE_RATE_API_URL=https://api.exchangerate.host/latest
EXCHANGE_RATE_FALLBACK_URL=https://open.er-api.com/v6/latest
```

**Note**: If you don't have an API key, the system will automatically use the fallback API (no key required).

### Application Configuration

```env
APP_NAME=Zadex Stellar Wallet
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8080
APP_PORT=8080
```

### Backend Configuration

```env
BACKEND_URL=http://localhost/backend/api
BACKEND_CORS_ORIGIN=http://localhost:8080
```

### Security Configuration

```env
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
PASSWORD_SALT=your_password_salt_here_change_this_in_production
SESSION_SECRET=your_session_secret_here_change_this_in_production
```

**Important**: Change these values in production!

### Frontend Configuration

```env
VITE_APP_NAME=Zadex Stellar Wallet
VITE_API_BASE_URL=http://localhost/backend/api
VITE_APP_URL=http://localhost:8080
```

## Getting an Exchange Rate API Key

### Option 1: exchangerate.host (Recommended)

1. Visit [exchangerate.host](https://exchangerate.host/)
2. Sign up for a free account
3. Get your API key
4. Add it to your `.env` file

### Option 2: Use Fallback API (No Key Required)

If you don't want to get an API key, the system will automatically use the fallback API (`open.er-api.com`) which doesn't require authentication.

## Database Setup

1. Make sure MySQL/MariaDB is running
2. Create a database named `zadex`
3. Import the schema:
   ```sql
   mysql -u root -p zadex < database-schema-fixed.sql
   ```

## Testing Your Configuration

1. **Test Database Connection**:

   ```bash
   curl http://localhost/backend/api/balance.php
   ```

2. **Test Exchange Rates**:

   ```bash
   curl http://localhost/backend/api/exchange_rates.php
   ```

3. **Test Frontend**:
   ```bash
   npm run dev
   ```
   Then visit: http://localhost:8080

## Environment File Security

- The `.env` file is automatically ignored by Git
- Never commit your `.env` file to version control
- Keep your API keys and secrets secure
- Use different values for development and production

## Troubleshooting

### Database Connection Issues

- Check if MySQL is running
- Verify database credentials in `.env`
- Ensure the `zadex` database exists

### API Issues

- Check if your API key is valid
- Verify internet connection
- Check if the API service is available

### Frontend Issues

- Ensure the backend URL is correct in `.env`
- Check if the backend is running
- Verify CORS settings

## Production Deployment

For production deployment:

1. Set `APP_ENV=production`
2. Set `APP_DEBUG=false`
3. Use strong, unique secrets
4. Use HTTPS URLs
5. Configure proper database credentials
6. Set up proper CORS origins

Example production `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com/api
JWT_SECRET=your_very_long_random_secret_here
PASSWORD_SALT=your_very_long_random_salt_here
SESSION_SECRET=your_very_long_random_session_secret_here
```
