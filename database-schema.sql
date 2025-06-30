-- Zadex Wallet Database Schema
-- Run this in your MySQL database (via phpMyAdmin or MySQL command line)

CREATE DATABASE IF NOT EXISTS zadex;
USE zadex;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wallets table (stores user balances for different currencies)
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_currency (user_id, currency),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdraw', 'transfer', 'convert') NOT NULL,
    currency_from VARCHAR(3) NOT NULL,
    currency_to VARCHAR(3),
    amount DECIMAL(15,2) NOT NULL,
    rate DECIMAL(10,4) DEFAULT 1.0000,
    balance_after DECIMAL(15,2) NOT NULL,
    status ENUM('completed', 'pending', 'failed') DEFAULT 'completed',
    counterparty_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counterparty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    threshold DECIMAL(15,2) NOT NULL,
    direction ENUM('above', 'below') NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exchange rates table (optional, for historical rates)
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currency_from VARCHAR(3) NOT NULL,
    currency_to VARCHAR(3) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rate_date (currency_from, currency_to, date)
);

-- Insert some sample data for testing
INSERT INTO users (name, email, password_hash, preferred_currency) VALUES
('Test User', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USD');

-- Insert sample wallet balance
INSERT INTO wallets (user_id, currency, balance) VALUES
(1, 'USD', 1000.00),
(1, 'EUR', 500.00); 