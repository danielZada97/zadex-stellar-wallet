
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
            className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Deposit
          </Button>
          <Button
            onClick={() => setWithdrawModalOpen(true)}
            className="h-16 bg-red-600 hover:bg-red-700 text-white"
          >
            <MinusCircle className="h-5 w-5 mr-2" />
            Withdraw
          </Button>
          <Button
            onClick={() => setTransferModalOpen(true)}
            className="h-16 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Transfer
          </Button>
          <Button
            onClick={() => setConvertModalOpen(true)}
            className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Convert
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction History */}
          <div className="lg:col-span-1">
            <TransactionHistory transactions={transactions} />
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel />
          </div>
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
