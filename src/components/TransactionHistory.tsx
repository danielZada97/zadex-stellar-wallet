import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  RefreshCw,
  ArrowDownRight,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer" | "receive" | "convert";
  currency_from?: string;
  currency_to?: string;
  amount: number;
  rate?: number;
  counterparty_name?: string;
  balance_after: number;
  created_at: string;
  status: "completed" | "pending" | "failed";
  counterparty_id?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentUserId?: string;
}

const TransactionHistory = ({
  transactions,
  currentUserId,
}: TransactionHistoryProps) => {
  const [filter, setFilter] = useState<string>("all");

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-400" />;
      case "receive":
        return <ArrowDownRight className="h-4 w-4 text-green-400" />;
      case "convert":
        return <RefreshCw className="h-4 w-4 text-purple-400" />;
      default:
        return <History className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (
      transaction.type === "transfer" &&
      transaction.counterparty_id === currentUserId
    ) {
      return `Received ${
        transaction.currency_to || transaction.currency_from
      } from ${transaction.counterparty_name || "Unknown"}`;
    }
    if (transaction.type === "transfer") {
      return `Sent ${transaction.currency_from} to ${
        transaction.counterparty_name || "Unknown"
      }`;
    }
    if (transaction.type === "deposit") {
      return `Deposited ${
        transaction.currency_to || transaction.currency_from
      }`;
    }
    if (transaction.type === "withdraw") {
      return `Withdrew ${transaction.currency_from}`;
    }
    if (transaction.type === "receive") {
      return `Received ${
        transaction.currency_to || transaction.currency_from
      } from ${transaction.counterparty_name || "Unknown"}`;
    }
    switch (transaction.type) {
      case "convert":
        return `Converted ${transaction.currency_from} to ${transaction.currency_to}`;
      default:
        return transaction.type;
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const currency =
      transaction.currency_to || transaction.currency_from || "USD";
    if (
      transaction.type === "transfer" &&
      transaction.counterparty_id === currentUserId
    ) {
      return `+${formatCurrency(transaction.amount, currency)}`;
    }
    const isIncoming =
      transaction.type === "deposit" || transaction.type === "receive";
    const sign = isIncoming ? "+" : "-";
    return `${sign}${formatCurrency(transaction.amount, currency)}`;
  };

  const filteredTransactions = transactions.filter(
    (transaction) => filter === "all" || transaction.type === filter
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-400" />
            Transaction History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={
                filter === "all"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "text-gray-400 hover:text-blue-400"
              }
            >
              All
            </Button>
            <Button
              variant={filter === "deposit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("deposit")}
              className={
                filter === "deposit"
                  ? "bg-green-500 hover:bg-green-600"
                  : "text-gray-400 hover:text-green-400"
              }
            >
              Deposits
            </Button>
            <Button
              variant={filter === "withdraw" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("withdraw")}
              className={
                filter === "withdraw"
                  ? "bg-red-500 hover:bg-red-600"
                  : "text-gray-400 hover:text-red-400"
              }
            >
              Withdrawals
            </Button>
            <Button
              variant={filter === "transfer" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("transfer")}
              className={
                filter === "transfer"
                  ? "bg-indigo-500 hover:bg-indigo-600"
                  : "text-gray-400 hover:text-indigo-400"
              }
            >
              Sent
            </Button>
            <Button
              variant={filter === "receive" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("receive")}
              className={
                filter === "receive"
                  ? "bg-green-500 hover:bg-green-600"
                  : "text-gray-400 hover:text-green-400"
              }
            >
              Received
            </Button>
            <Button
              variant={filter === "convert" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("convert")}
              className={
                filter === "convert"
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "text-gray-400 hover:text-purple-400"
              }
            >
              Converts
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
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-600/50 rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {getTransactionDescription(transaction)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-semibold">
                    {getTransactionAmount(transaction)}
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
