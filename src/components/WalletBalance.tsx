
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exchangeRatesService } from "@/services/exchangeRatesService";

interface WalletBalanceProps {
  balances: Record<string, number>;
  displayCurrency: string;
}

const WalletBalance = ({ balances, displayCurrency }: WalletBalanceProps) => {
  const [showBalances, setShowBalances] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.85,
    ILS: 3.7,
    GBP: 0.73,
    JPY: 110
  });
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const rates = await exchangeRatesService.getCurrentRates();
        console.log('Setting exchange rates:', rates);
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotal = () => {
    let total = 0;
    console.log('Calculating total balance:');
    console.log('Display currency:', displayCurrency);
    console.log('Exchange rates:', exchangeRates);
    console.log('Balances:', balances);
    
    Object.entries(balances).forEach(([currency, amount]) => {
      if (currency === displayCurrency) {
        total += amount;
        console.log(`${currency}: ${amount} (same currency, added directly)`);
      } else {
        // Convert from source currency to display currency
        // Formula: amount * (1 / source_rate) * display_rate
        // Since our rates are already USD-based, we need to convert properly
        const sourceRate = exchangeRates[currency] || 1;
        const displayRate = exchangeRates[displayCurrency] || 1;
        
        let convertedAmount;
        if (displayCurrency === 'USD') {
          // Converting to USD: divide by source rate
          convertedAmount = amount / sourceRate;
        } else if (currency === 'USD') {
          // Converting from USD: multiply by display rate
          convertedAmount = amount * displayRate;
        } else {
          // Converting between two non-USD currencies: USD -> display currency
          convertedAmount = (amount / sourceRate) * displayRate;
        }
        
        total += convertedAmount;
        console.log(`${currency}: ${amount} * conversion = ${convertedAmount.toFixed(2)} ${displayCurrency}`);
      }
    });
    
    console.log('Total balance:', total);
    return total;
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    if (toCurrency === 'USD') {
      return amount / fromRate;
    } else if (fromCurrency === 'USD') {
      return amount * toRate;
    } else {
      return (amount / fromRate) * toRate;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const total = calculateTotal();

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-cyan-400" />
            <CardTitle className="text-white">Wallet Balance</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalances(!showBalances)}
            className="text-gray-400 hover:text-cyan-400"
          >
            {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-gray-300">
          Total balance in {displayCurrency} {isLoadingRates && <span className="text-cyan-400">(updating rates...)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Balance */}
          <div className="text-center p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {showBalances ? formatCurrency(total, displayCurrency) : "••••••"}
            </div>
            <div className="text-gray-400 text-sm mt-1">Total Balance</div>
          </div>

          {/* Individual Balances */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(balances).map(([currency, amount]) => (
              <div key={currency} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <div className="text-sm text-gray-400 mb-1">{currency}</div>
                <div className="text-lg font-semibold text-white">
                  {showBalances ? formatCurrency(amount, currency) : "••••"}
                </div>
                {currency !== displayCurrency && (
                  <div className="text-xs text-cyan-400 mt-1">
                    ≈ {showBalances ? formatCurrency(convertCurrency(amount, currency, displayCurrency), displayCurrency) : "••••"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Market Status */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Market Status</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isLoadingRates ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
              <span className={isLoadingRates ? 'text-yellow-400' : 'text-green-400'}>
                {isLoadingRates ? 'Updating' : 'Live'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
