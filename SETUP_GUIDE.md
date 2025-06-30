# Zadex Wallet - Backend Connection Setup Guide

## ✅ What I've Fixed

1. **Updated API Service Files** - Fixed response formats to match frontend expectations
2. **Added CORS Headers** - All PHP files now support cross-origin requests
3. **Created Missing Files** - Added `balance.php` that was missing
4. **Fixed Vite Proxy** - Updated to point to your XAMPP backend
5. **Copied Files** - All PHP files copied to `C:\xampp\htdocs\backend\api\`

## 🚀 Setup Steps

### 1. Start XAMPP

- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services
- Verify they're running (green status)

### 2. Set Up Database

- Open phpMyAdmin: http://localhost/phpmyadmin
- Create a new database called `zadex`
- Import the `database-schema.sql` file or run the SQL commands manually

### 3. Test the Connection

- Your React app should already be running at http://localhost:8080/
- Open http://localhost:8080/test-api.html in your browser
- Click the test buttons to verify API connections

### 4. Test the Main App

- Go to http://localhost:8080/
- Try to register a new user
- Try to login with existing credentials

## 📁 File Locations

### Frontend (React)

- **Location**: `C:\Users\danie\OneDrive\Desktop\projects\Wallet\frontend\zadex-stellar-wallet\`
- **API Service**: `src/services/zadexApi.ts`
- **Vite Config**: `vite.config.ts`

### Backend (PHP)

- **Location**: `C:\xampp\htdocs\backend\api\`
- **Database Config**: `db.php`
- **API Endpoints**: All `.php` files

## 🔧 API Endpoints

| Endpoint                        | Method          | Purpose                 |
| ------------------------------- | --------------- | ----------------------- |
| `/backend/api/register.php`     | POST            | User registration       |
| `/backend/api/login.php`        | POST            | User login              |
| `/backend/api/balance.php`      | GET             | Get user balances       |
| `/backend/api/deposit.php`      | POST            | Deposit funds           |
| `/backend/api/withdraw.php`     | POST            | Withdraw funds          |
| `/backend/api/transfer.php`     | POST            | Transfer between users  |
| `/backend/api/convert.php`      | POST            | Currency conversion     |
| `/backend/api/transactions.php` | GET             | Get transaction history |
| `/backend/api/alerts.php`       | GET/POST/DELETE | Manage price alerts     |

## 🐛 Troubleshooting

### If you get CORS errors:

- Make sure XAMPP Apache is running
- Check that the proxy in `vite.config.ts` is correct
- Verify PHP files are in the right location

### If database connection fails:

- Check MySQL is running in XAMPP
- Verify database credentials in `api/db.php`
- Make sure the `zadex` database exists

### If API calls fail:

- Check browser DevTools Network tab for errors
- Verify the API endpoints are accessible at http://localhost/backend/api/
- Test with the `test-api.html` file

## 📝 Database Schema

The database includes these tables:

- `users` - User accounts and authentication
- `wallets` - User balances for different currencies
- `transactions` - All financial transactions
- `alerts` - Price alert settings
- `exchange_rates` - Historical exchange rates

## 🎯 Next Steps

1. **Test Registration/Login** - Verify user authentication works
2. **Test Deposits** - Try depositing funds to test transactions
3. **Test Balance Display** - Check if balances show correctly
4. **Test Other Features** - Try transfers, conversions, alerts

## 📞 Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the XAMPP error logs
3. Use the test page to isolate API issues
4. Verify all files are in the correct locations

Your React app should now be fully connected to your XAMPP backend! 🎉
