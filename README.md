# Zadex Stellar Wallet

## Overview

Zadex Stellar Wallet is a full-stack web application for managing digital assets on the Stellar blockchain. It provides a user-friendly interface for account management, currency conversion, transfers, deposits, withdrawals, and real-time exchange rates. The project is containerized using Docker for easy deployment and development.

## Features

- User registration and authentication
- View wallet balances and transaction history
- Deposit and withdraw funds
- Transfer assets to other users
- Currency conversion with real-time exchange rates
- Alerts and notifications
- Responsive UI built with React, TypeScript, Tailwind CSS, and shadcn-ui

## Project Structure

```
├── api/                # PHP backend API endpoints
├── src/                # Frontend React application
├── Dockerfile.frontend # Dockerfile for frontend
├── Dockerfile.backend  # Dockerfile for backend
├── docker-compose.yml  # Orchestrates frontend, backend, and database
├── ...                 # Other configuration and utility files
```

## Architecture

- **Frontend:** React + Vite + TypeScript (served by Nginx in production)
- **Backend:** PHP (served by Apache in Docker)
- **Database:** MySQL (can be local or remote)
- **Containerization:** Docker & Docker Compose

## Usage

### 1. Clone the Repository

```sh
git clone <YOUR_GIT_URL>
cd zadex-stellar-wallet
```

### 2. Configure Environment Variables

Edit `docker-compose.yml` and set the following environment variables under the `backend` service to match your remote MySQL server:

```yaml
DB_HOST: <REMOTE_MYSQL_HOST>
DB_NAME: <REMOTE_DATABASE_NAME>
DB_USER: <REMOTE_USERNAME>
DB_PASS: <REMOTE_PASSWORD>
DB_PORT: <REMOTE_MYSQL_PORT>
```

### 3. Build and Run with Docker Compose

```sh
docker-compose up --build
```

- The **frontend** will be available at [http://localhost:8082](http://localhost:8082)
- The **backend API** will be available at [http://localhost:8081](http://localhost:8081)

### 4. Stopping the Project

To stop and remove all containers:

```sh
docker-compose down
```

## Quick Start Script

You can use the following script to quickly set up and start the project:

**For Windows (PowerShell):**

```powershell
# Stop and remove any existing containers and volumes
docker-compose down -v
# Build and start the project
docker-compose up --build
```

**For Linux/macOS (bash):**

```bash
# Stop and remove any existing containers and volumes
docker-compose down -v
# Build and start the project
docker-compose up --build
```

- The **frontend** will be available at [http://localhost:8082](http://localhost:8082)
- The **backend API** will be available at [http://localhost:8081](http://localhost:8081)

## How to Install Docker and Docker Compose

1. **Install Docker Desktop:**
   - Download and install from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Follow the installation instructions for your OS (Windows, Mac, Linux)
2. **Verify Installation:**
   - Open a terminal and run:
     ```sh
     docker --version
     docker-compose --version
     ```

## Notes

- Make sure your remote MySQL server allows external connections and your credentials are correct.
- If you want to use a local MySQL container, you can add the service back in `docker-compose.yml`.
- For development without Docker, you can run the frontend with `npm install && npm run dev` and serve the backend with a local PHP server.

## License

MIT
