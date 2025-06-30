<!-- Banner -->
<p align="center">
  <img src="public/placeholder.svg" alt="Zadex Stellar Wallet" width="120"/>
</p>

<h1 align="center">💸 Zadex Stellar Wallet</h1>

<p align="center">
  <b>Multi-currency digital wallet with real-time exchange, history, and alerts</b>
</p>

<p align="center">
  <a href="#dockerized-setup"><img src="https://img.shields.io/badge/Dockerized-Yes-blue?logo=docker" alt="Dockerized"/></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"/></a>
  <a href="#how-to-run"><img src="https://img.shields.io/badge/Quick%20Start-Easy-brightgreen" alt="Quick Start"/></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Dockerized Setup](#dockerized-setup)
- [Usage](#usage)
- [Quick Start Script](#quick-start-script)
- [How to Install Docker and Docker Compose](#how-to-install-docker-and-docker-compose)
- [Receiver Instructions](#receiver-instructions)
- [Using phpMyAdmin for Database Management](#using-phpmyadmin-for-database-management)
- [License](#license)

---

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

## Screenshots

> **Tip:** Add your own screenshots to the `public/` folder and update the links below.

<p align="center">
  <img src="public/screenshot-dashboard.png" alt="Dashboard Screenshot" width="600"/>
</p>
<p align="center">
  <img src="public/screenshot-exchange.png" alt="Exchange Screenshot" width="600"/>
</p>

## Project Structure

```
├── api/                # PHP backend API endpoints
├── src/                # Frontend React application
├── Dockerfile.frontend # Dockerfile for frontend
├── Dockerfile.backend  # Dockerfile for backend
├── docker-compose.yml  # Orchestrates frontend, backend, database, phpmyadmin
├── ...                 # Other configuration and utility files
```

## Dockerized Setup

This project uses Docker Compose to orchestrate all services:

- **mysql**: MySQL database for storing user data, transactions, and rates.
- **phpmyadmin**: Web UI for managing the MySQL database (http://localhost:8083).
- **backend**: PHP API (Apache) for business logic and database access (http://localhost:8081).
- **frontend**: React app (Nginx) for the user interface (http://localhost:8082).

All services are defined in `docker-compose.yml` and communicate over a private Docker network. The backend and phpMyAdmin both connect to the MySQL service using the service name `mysql`.

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

## Receiver Instructions

1. **Unzip the Project**

   - Extract the contents of the zip file to your desired location.

2. **Set Up Environment Variables**

   - Copy `env.example` to `.env` in the project root.
   - Edit `.env` and fill in your own database credentials, API keys, and other settings as needed.

3. **Install Docker and Docker Compose**

   - If you haven't already, install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).

4. **Start the Project**

   - Open a terminal in the project directory.
   - Run the quick start script:
     ```sh
     docker-compose down -v
     docker-compose up --build
     ```
   - The frontend will be available at [http://localhost:8082](http://localhost:8082)
   - The backend API will be available at [http://localhost:8081](http://localhost:8081)

5. **Troubleshooting**
   - Ensure your `.env` values are correct and your MySQL server is accessible.
   - Check Docker Desktop for container logs if something doesn't work as expected.

If you have any issues, please refer to the README or contact the project maintainer.

## Using phpMyAdmin for Database Management

phpMyAdmin is included for easy management of your MySQL database.

- Access phpMyAdmin at: [http://localhost:8083](http://localhost:8083)
- **Login credentials:**
  - Server: `mysql`
  - Username: `root`
  - Password: `root`

You can use phpMyAdmin to view, edit, and manage your database tables and data.
