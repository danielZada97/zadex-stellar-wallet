
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Wallet, TrendingUp, Users, AlertCircle, LogOut, Plus, Minus, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WalletBalance from "@/components/WalletBalance";
import TransactionHistory from "@/components/TransactionHistory";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import DepositWithdrawModal from "@/components/DepositWithdrawModal";
import TransferModal from "@/components/TransferModal";
import AlertsPanel from "@/components/AlertsPanel";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [balances, setBalances] = useState<any>({});
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('zadex_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setDisplayCurrency(parsedUser.preferred_currency || 'USD');
    
    // Load demo balances
    loadBalances();
  }, [navigate]);

  const loadBalances = () => {
    // Demo data - replace with actual API call
    setBalances({
      USD: 1250.50,
      EUR: 890.75,
      ILS: 3420.25,
      GBP: 650.00,
      JPY: 125000.00
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('zadex_user');
    localStorage.removeItem('zadex_token');
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Zap className="h-8 w-8 text-cyan-400 animate-pulse" />
                  <div className="absolute -inset-1 bg-cyan-400 rounded-full blur opacity-30"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ZADEX
                </span>
              </div>
              <div className="text-gray-300">
                Welcome back, <span className="text-cyan-400 font-medium">{user.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['USD', 'EUR', 'ILS', 'GBP', 'JPY'].map((currency) => (
                    <SelectItem key={currency} value={currency} className="text-white hover:bg-slate-700">
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button
            onClick={() => setShowDepositModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            <Minus className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
          <Button
            onClick={() => setShowTransferModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Transfer
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Wallet Balance */}
            <WalletBalance 
              balances={balances} 
              displayCurrency={displayCurrency}
            />

            {/* Exchange Rate Chart */}
            <ExchangeRateChart />

            {/* Transaction History */}
            <TransactionHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Alerts Panel */}
            <AlertsPanel />

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Transactions</span>
                  <span className="text-cyan-400 font-semibold">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">This Month</span>
                  <span className="text-green-400 font-semibold">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Alerts</span>
                  <span className="text-yellow-400 font-semibold">3</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositWithdrawModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        type="deposit"
        onSuccess={loadBalances}
      />
      
      <DepositWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        type="withdraw"
        onSuccess={loadBalances}
      />
      
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={loadBalances}
      />
    </div>
  );
};

export default Dashboard;
