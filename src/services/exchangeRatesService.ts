export class ExchangeRatesService {
  private static instance: ExchangeRatesService;
  private cachedRates: Record<string, number> | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ExchangeRatesService {
    if (!ExchangeRatesService.instance) {
      ExchangeRatesService.instance = new ExchangeRatesService();
    }
    return ExchangeRatesService.instance;
  }

  async getCurrentRates(): Promise<Record<string, number>> {
    const now = Date.now();
    if (this.cachedRates && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedRates;
    }
    try {
      const response = await fetch('/backend/api/exchange_rates.php');
      const data = await response.json();
      if (data.success && data.latest) {
        // data.latest is an array of { currency_from, currency_to, rate, date }
        const rates: Record<string, number> = { ILS: 1 };
        data.latest.forEach((item: any) => {
          rates[item.currency_from] = item.rate;
        });
        this.cachedRates = rates;
        this.cacheTimestamp = now;
        return rates;
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates from backend:', error);
    }
    // Fallback: just return ILS=1
    return { ILS: 1 };
  }

  async getHistoricalRates(currency: string, days: number = 30): Promise<{ date: string, rate: number }[]> {
    try {
      const response = await fetch(`/backend/api/rate_history.php?currency=${currency}&days=${days}`);
      const data = await response.json();
      if (data.success && data.history) {
        // data.history should be an array of { date, rate }
        return data.history;
      }
    } catch (error) {
      console.error('Failed to fetch historical rates:', error);
    }
    return [];
  }
}

export const exchangeRatesService = ExchangeRatesService.getInstance();
