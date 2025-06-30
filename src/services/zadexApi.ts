const API_BASE_URL = '/backend/api';

interface User {
  user_id: number;
  name: string;
  preferred_currency: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'receive' | 'convert';
  currency_from?: string;
  currency_to?: string;
  amount: number;
  rate?: number;
  balance_after: number;
  created_at: string;
  counterparty_name?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Alert {
  id: number;
  currency: string;
  threshold: number;
  direction: 'above' | 'below';
  is_triggered: boolean;
  created_at: string;
}

export class ZadexApi {
  private static getStoredUser(): User | null {
    const userData = localStorage.getItem('zadex_user');
    return userData ? JSON.parse(userData) : null;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  static async register(name: string, email: string, password: string, preferredCurrency: string): Promise<ApiResponse<User>> {
    return this.request<User>('/register.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, preferred_currency: preferredCurrency }),
    });
  }

  static async login(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Balance
  static async getBalance(userId: number, displayCurrency: string): Promise<ApiResponse<Record<string, number>>> {
    return this.request<Record<string, number>>(
      `/balance.php?user_id=${userId}&display_currency=${displayCurrency}`
    );
  }

  // Transactions
  static async deposit(userId: number, currency: string, amount: number): Promise<ApiResponse> {
    return this.request('/deposit.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, currency, amount }),
    });
  }

  static async withdraw(userId: number, currency: string, amount: number): Promise<ApiResponse> {
    return this.request('/withdraw.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, currency, amount }),
    });
  }

  static async convert(
    userId: number,
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<ApiResponse> {
    return this.request('/convert.php', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      }),
    });
  }

  static async transfer(
    fromUserId: number,
    toUserEmail: string,
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<ApiResponse> {
    return this.request('/transfer.php', {
      method: 'POST',
      body: JSON.stringify({
        from_user_id: fromUserId,
        to_user_email: toUserEmail,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount,
      }),
    });
  }

  static async getTransactions(userId: number): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(`/transactions.php?user_id=${userId}`);
  }

  // Exchange Rates
  static async updateExchangeRates(): Promise<ApiResponse> {
    return this.request('/exchange_rates.php');
  }

  // Alerts
  static async createAlert(
    userId: number,
    currency: string,
    threshold: number,
    direction: 'above' | 'below'
  ): Promise<ApiResponse> {
    return this.request('/alerts.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, currency, threshold, direction }),
    });
  }

  static async getAlerts(userId: number): Promise<ApiResponse<Alert[]>> {
    return this.request<Alert[]>(`/alerts.php?user_id=${userId}`);
  }

  static async deleteAlert(alertId: number): Promise<ApiResponse> {
    return this.request(`/alerts.php?alert_id=${alertId}`, {
      method: 'DELETE',
    });
  }
}
