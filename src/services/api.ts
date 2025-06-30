// API Service Layer for Zadex Backend Integration
// This file provides a clean interface for all backend communication

const API_BASE_URL = '/backend/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  preferred_currency: string;
  created_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface WalletBalance {
  currency: string;
  balance: number;
}

interface Transaction {
  id: string;
  user_id: number;
  type: 'deposit' | 'withdraw' | 'transfer';
  currency_from: string;
  currency_to?: string;
  amount: number;
  rate: number;
  counterparty_id?: number;
  counterparty_email?: string;
  balance_after: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface ExchangeRate {
  id: number;
  date: string;
  currency: string;
  rate_to_ils: number;
}

interface Alert {
  id: number;
  user_id: number;
  currency: string;
  threshold: number;
  direction: 'above' | 'below';
  is_triggered: boolean;
  created_at: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('zadex_token');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    preferred_currency: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Wallet endpoints
  async getBalance(displayCurrency: string = 'ILS'): Promise<ApiResponse<{
    balances: WalletBalance[];
    total_in_display_currency: number;
  }>> {
    return this.makeRequest<{
      balances: WalletBalance[];
      total_in_display_currency: number;
    }>(`/balance?display_currency=${displayCurrency}`);
  }

  async deposit(currency: string, amount: number): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/deposit', {
      method: 'POST',
      body: JSON.stringify({ currency, amount }),
    });
  }

  async withdraw(currency: string, amount: number): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ currency, amount }),
    });
  }

  async transfer(
    recipientEmail: string,
    currency: string,
    amount: number
  ): Promise<ApiResponse<Transaction>> {
    return this.makeRequest<Transaction>('/transfer', {
      method: 'POST',
      body: JSON.stringify({
        recipient_email: recipientEmail,
        currency,
        amount,
      }),
    });
  }

  // Transaction history
  async getTransactions(
    limit: number = 50,
    offset: number = 0,
    type?: string
  ): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(type && { type }),
    });
    
    return this.makeRequest<Transaction[]>(`/transactions?${params}`);
  }

  // Exchange rates
  async getExchangeRates(currency?: string): Promise<ApiResponse<ExchangeRate[]>> {
    const params = currency ? `?currency=${currency}` : '';
    return this.makeRequest<ExchangeRate[]>(`/exchange-rates${params}`);
  }

  async getCurrentRates(): Promise<ApiResponse<Record<string, number>>> {
    return this.makeRequest<Record<string, number>>('/exchange-rates/current');
  }

  // Alerts
  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.makeRequest<Alert[]>('/alerts');
  }

  async setAlert(
    currency: string,
    threshold: number,
    direction: 'above' | 'below'
  ): Promise<ApiResponse<Alert>> {
    return this.makeRequest<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify({ currency, threshold, direction }),
    });
  }

  async checkAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.makeRequest<Alert[]>('/alerts/check');
  }

  async deleteAlert(alertId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // Real-time exchange rate fetching (fallback to public APIs)
  async fetchLiveRates(): Promise<Record<string, number>> {
    try {
      // Try Bank of Israel API first
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      return {
        USD: 1,
        EUR: data.rates.EUR || 0.85,
        ILS: data.rates.ILS || 3.7,
        GBP: data.rates.GBP || 0.73,
        JPY: data.rates.JPY || 110,
      };
    } catch (error) {
      console.error('Failed to fetch live rates:', error);
      // Return fallback rates
      return {
        USD: 1,
        EUR: 0.85,
        ILS: 3.7,
        GBP: 0.73,
        JPY: 110,
      };
    }
  }
}

export const apiService = new ApiService();
export type { User, Transaction, ExchangeRate, Alert, WalletBalance };
