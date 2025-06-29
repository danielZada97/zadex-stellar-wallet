
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Filter } from "lucide-react";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  currency: string;
  rate?: number;
  counterparty?: string;
  balance_after: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Demo data - replace with actual API call
    setTransactions([
      {
        id: '1',
        type: 'deposit',
        amount: 500,
        currency: 'USD',
        rate: 1,
        balance_after: 1250.50,
        created_at: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        type: 'transfer',
        amount: 100,
        currency: 'EUR',
        counterparty: 'john@example.com',
        rate: 0.85,
        balance_after: 890.75,
        created_at: '2024-01-14T15:45:00Z',
        status: 'completed'
      },
      {
        id: '3',
        type: 'withdraw',
        amount: 200,
        currency: 'USD',
        rate: 1,
        balance_after: 750.50,
        created_at: '2024-01-13T09:15:00Z',
        status: 'completed'
      },
      {
        id: '4',
        type: 'deposit',
        amount: 1000,
        currency: 'ILS',
        rate: 3.7,
        balance_after: 3420.25,
        created_at: '2024-01-12T14:20:00Z',
        status: 'completed'
      },
      {
        id: '5',
        type: 'transfer',
        amount: 50,
        currency: 'GBP',
        counterparty: 'sarah@example.com',
        rate: 0.73,
        balance_after: 650.00,
        created_at: '2024-01-11T11:30:00Z',
        status: 'pending'
      }
    ]);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-400" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.type === filter
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2 text-cyan-400" />
            Transaction History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-cyan-500 hover:bg-cyan-600' : 'text-gray-400 hover:text-cyan-400'}
            >
              All
            </Button>
            <Button
              variant={filter === 'deposit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('deposit')}
              className={filter === 'deposit' ? 'bg-green-500 hover:bg-green-600' : 'text-gray-400 hover:text-green-400'}
            >
              Deposits
            </Button>
            <Button
              variant={filter === 'withdraw' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('withdraw')}
              className={filter === 'withdraw' ? 'bg-red-500 hover:bg-red-600' : 'text-gray-400 hover:text-red-400'}
            >
              Withdrawals
            </Button>
            <Button
              variant={filter === 'transfer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('transfer')}
              className={filter === 'transfer' ? 'bg-blue-500 hover:bg-blue-600' : 'text-gray-400 hover:text-blue-400'}
            >
              Transfers
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No transactions found for the selected filter.
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-600/50 rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="text-white font-medium capitalize">
                      {transaction.type}
                      {transaction.counterparty && (
                        <span className="text-gray-400 font-normal">
                          {' '}to {transaction.counterparty}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {transaction.type === 'withdraw' ? '-' : '+'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    {transaction.rate && transaction.rate !== 1 && (
                      <span className="text-xs text-gray-400">
                        @ {transaction.rate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
