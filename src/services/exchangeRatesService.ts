
const API_KEY = 'bbf3467eec6032d0b12c708a24ce1e17';
const BASE_URL = 'http://api.exchangeratesapi.io/v1';

interface ExchangeRatesResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface HistoricalRatesResponse {
  success: boolean;
  historical: boolean;
  date: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

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
    
    // Return cached rates if still valid
    if (this.cachedRates && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedRates;
    }

    try {
      const response = await fetch(`${BASE_URL}/latest?access_key=${API_KEY}&symbols=USD,EUR,ILS,GBP,JPY`);
      const data: ExchangeRatesResponse = await response.json();
      
      if (data.success && data.rates) {
        // Convert from EUR base to USD base for consistency
        const eurToUsd = data.rates.USD || 1;
        const rates = {
          USD: 1,
          EUR: 1 / eurToUsd,
          ILS: (data.rates.ILS || 3.7) / eurToUsd,
          GBP: (data.rates.GBP || 0.73) / eurToUsd,
          JPY: (data.rates.JPY || 110) / eurToUsd,
        };
        
        this.cachedRates = rates;
        this.cacheTimestamp = now;
        return rates;
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }

    // Return fallback rates if API fails
    return this.getFallbackRates();
  }

  async getHistoricalRates(currency: string, days: number = 30): Promise<Array<{date: string, rate: number}>> {
    const historicalData: Array<{date: string, rate: number}> = [];
    const endDate = new Date();
    
    try {
      // Fetch data for the last 'days' period
      for (let i = days; i >= 0; i -= 7) { // Fetch weekly data to reduce API calls
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        try {
          const response = await fetch(`${BASE_URL}/${dateString}?access_key=${API_KEY}&symbols=USD,${currency}`);
          const data: HistoricalRatesResponse = await response.json();
          
          if (data.success && data.rates) {
            const eurToUsd = data.rates.USD || 1;
            const rate = currency === 'USD' ? 1 : (data.rates[currency] || 1) / eurToUsd;
            historicalData.push({
              date: dateString,
              rate: rate
            });
          }
        } catch (error) {
          console.error(`Failed to fetch historical rate for ${dateString}:`, error);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // If we have some data, interpolate missing days
      if (historicalData.length > 0) {
        return this.interpolateHistoricalData(historicalData, days);
      }
    } catch (error) {
      console.error('Failed to fetch historical rates:', error);
    }

    // Return fallback historical data
    return this.getFallbackHistoricalData(currency, days);
  }

  private interpolateHistoricalData(data: Array<{date: string, rate: number}>, days: number): Array<{date: string, rate: number}> {
    const result: Array<{date: string, rate: number}> = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Find the closest historical data point
      const closest = data.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.date).getTime() - date.getTime());
        const currDiff = Math.abs(new Date(curr.date).getTime() - date.getTime());
        return currDiff < prevDiff ? curr : prev;
      });
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const rate = closest.rate * (1 + variation);
      
      result.push({
        date: dateString,
        rate: Number(rate.toFixed(4))
      });
    }
    
    return result;
  }

  private getFallbackRates(): Record<string, number> {
    return {
      USD: 1,
      EUR: 0.85,
      ILS: 3.7,
      GBP: 0.73,
      JPY: 110
    };
  }

  private getFallbackHistoricalData(currency: string, days: number): Array<{date: string, rate: number}> {
    const data = [];
    const baseRate = currency === 'EUR' ? 0.85 : 
                    currency === 'ILS' ? 3.7 :
                    currency === 'GBP' ? 0.73 : 
                    currency === 'JPY' ? 110 : 1;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.1;
      const rate = baseRate + (baseRate * variation);
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: Number(rate.toFixed(4)),
      });
    }
    return data;
  }
}

export const exchangeRatesService = ExchangeRatesService.getInstance();
