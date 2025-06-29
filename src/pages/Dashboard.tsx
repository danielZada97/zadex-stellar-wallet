
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, LogOut, PlusCircle, MinusCircle, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";
import { useQuery } from "@tanstack/react-query";
import TransactionHistory from "@/components/TransactionHistory";
import AlertsPanel from "@/components/AlertsPanel";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import TransferModal from "@/components/TransferModal";
import ConvertModal from "@/components/ConvertModal";

interface Balance {
  currency: string;
  amount: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'convert';
  amount: number;
  currency: string;
  rate?: number;
  counterparty?: string;
  balance_after: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface UserData {
  name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const { data: initialBalances, refetch: refetchBalances } = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const response = await ZadexApi.getBalance(userData.user_id, userData.preferred_currency || 'USD');
      if (response.success && response.data) {
        return Object.entries(response.data).map(([currency, amount]) => ({
          currency,
          amount: amount as number
        }));
      }
      return [];
    },
  });

  useEffect(() => {
    if (initialBalances) {
      setBalances(initialBalances);
    }
  }, [initialBalances]);

  const { data: initialTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const response = await ZadexApi.getTransactions(userData.user_id);
      if (response.success && response.data) {
        return response.data.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency_from || transaction.currency,
          rate: transaction.rate,
          counterparty: transaction.counterparty_name,
          balance_after: transaction.balance_after,
          created_at: transaction.created_at,
          status: 'completed' as const
        }));
      }
      return [];
    },
  });

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions);
    }
  }, [initialTransactions]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
    toast({
      title: "Logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userData?.name || 'User'}
            </h1>
            <p className="text-slate-300">Manage your digital currency portfolio</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Wallet Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {balances.map((balance) => (
            <Card key={balance.currency} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{balance.currency}</span>
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Available Balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: balance.currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(balance.amount)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => setDepositModalOpen(true)}
            className="h-20 bg-gradient-to-br from-blue-500/10 via-blue-400/20 to-cyan-400/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl shadow-blue-900/50 hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-105 hover:bg-gradient-to-br hover:from-blue-400/20 hover:via-blue-300/30 hover:to-cyan-300/20 flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden group hover:border-white/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
            <PlusCircle className="h-6 w-6 relative z-10 drop-shadow-lg" />
            <span className="font-semibold relative z-10 drop-shadow-md">Deposit</span>
          </Button>
          <Button
            onClick={() => setWithdrawModalOpen(true)}
            className="h-20 bg-gradient-to-br from-red-500/10 via-red-400/20 to-orange-400/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl shadow-red-900/50 hover:shadow-red-500/30 transition-all duration-500 transform hover:scale-105 hover:bg-gradient-to-br hover:from-red-400/20 hover:via-red-300/30 hover:to-orange-300/20 flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden group hover:border-white/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent" />
            <MinusCircle className="h-6 w-6 relative z-10 drop-shadow-lg" />
            <span className="font-semibold relative z-10 drop-shadow-md">Withdraw</span>
          </Button>
          <Button
            onClick={() => setTransferModalOpen(true)}
            className="h-20 bg-gradient-to-br from-indigo-500/10 via-indigo-400/20 to-purple-400/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl shadow-indigo-900/50 hover:shadow-indigo-500/30 transition-all duration-500 transform hover:scale-105 hover:bg-gradient-to-br hover:from-indigo-400/20 hover:via-indigo-300/30 hover:to-purple-300/20 flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden group hover:border-white/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent" />
            <ArrowRightLeft className="h-6 w-6 relative z-10 drop-shadow-lg" />
            <span className="font-semibold relative z-10 drop-shadow-md">Transfer</span>
          </Button>
          <Button
            onClick={() => setConvertModalOpen(true)}
            className="h-20 bg-gradient-to-br from-purple-500/10 via-purple-400/20 to-pink-400/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl shadow-purple-900/50 hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:bg-gradient-to-br hover:from-purple-400/20 hover:via-purple-300/30 hover:to-pink-300/20 flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden group hover:border-white/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent" />
            <RefreshCw className="h-6 w-6 relative z-10 drop-shadow-lg" />
            <span className="font-semibold relative z-10 drop-shadow-md">Convert</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transaction History */}
          <div className="lg:col-span-1">
            <TransactionHistory transactions={transactions} />
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel />
          </div>
        </div>

        {/* Exchange Rate Chart - Full Width */}
        <div className="mb-8">
          <ExchangeRateChart />
        </div>

        {/* Modals */}
        <DepositModal
          open={depositModalOpen}
          onOpenChange={setDepositModalOpen}
          balances={balances}
          onBalancesUpdate={refetchBalances}
          onTransactionsUpdate={refetchTransactions}
        />
        <WithdrawModal
          open={withdrawModalOpen}
          onOpenChange={setWithdrawModalOpen}
          balances={balances}
          onBalancesUpdate={refetchBalances}
          onTransactionsUpdate={refetchTransactions}
        />
        <TransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          balances={balances}
          onBalancesUpdate={refetchBalances}
          onTransactionsUpdate={refetchTransactions}
        />
        <ConvertModal
          open={convertModalOpen}
          onOpenChange={setConvertModalOpen}
          balances={balances}
          onBalancesUpdate={refetchBalances}
          onTransactionsUpdate={refetchTransactions}
        />
      </div>
    </div>
  );
};

export default Dashboard;
