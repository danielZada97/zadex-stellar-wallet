
# Zadex Digital Wallet - Local Setup Guide

## Prerequisites

Before running this project locally, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (to clone the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Environment Setup

This project uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables to your `.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api
VITE_API_BASE_URL=/backend/api

# Development Configuration
NODE_ENV=development
```

### 4. Start the Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── DepositModal.tsx
│   ├── WithdrawModal.tsx
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/           # API services
│   ├── zadexApi.ts
│   └── api.ts
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Backend Requirements

**Note: This frontend application requires a backend API to function properly.**

The application expects a backend server running on `http://localhost:8000/api` with the following endpoints:

### Authentication
- `POST /login.php` - User login
- `POST /register.php` - User registration

### Wallet Operations
- `GET /balance.php` - Get user balance
- `POST /deposit.php` - Deposit funds
- `POST /withdraw.php` - Withdraw funds
- `POST /convert.php` - Convert currencies
- `POST /transfer.php` - Transfer funds

### Transactions
- `GET /transactions.php` - Get transaction history

### Alerts
- `GET /alerts.php` - Get user alerts
- `POST /alerts.php` - Create new alert
- `DELETE /alerts.php` - Delete alert

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts

## Features

- User authentication (login/register)
- Multi-currency wallet management
- Deposit and withdraw funds
- Currency conversion
- Money transfers between users
- Transaction history
- Exchange rate alerts
- Responsive design

## Development Notes

1. **Hot Reload**: The development server supports hot module replacement
2. **TypeScript**: Full TypeScript support with strict type checking
3. **Responsive Design**: Built with mobile-first approach using Tailwind CSS
4. **Error Handling**: Comprehensive error handling with toast notifications

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   ```bash
   # Kill process using port 8080
   lsof -ti:8080 | xargs kill -9
   ```

2. **Module not found errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Backend connection issues**
   - Ensure your backend server is running
   - Check the API_BASE_URL in your environment variables
   - Verify CORS settings on your backend

### Development Tips

- Use browser developer tools to monitor network requests
- Check the console for any JavaScript errors
- The app uses local storage for user session management

## Production Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

## Support

If you encounter any issues:

1. Check that all dependencies are installed correctly
2. Ensure your Node.js version is 18+
3. Verify that the backend API is running and accessible
4. Check browser console for error messages

## License

This project is part of the Zadex digital wallet application.
