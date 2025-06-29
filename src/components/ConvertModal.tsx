
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";
import { Loader2 } from "lucide-react";

interface Balance {
  currency: string;
  amount: number;
}

interface ConvertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: Balance[];
  onBalancesUpdate: () => void;
  onTransactionsUpdate: () => void;
}

const ConvertModal = ({ open, onOpenChange, balances, onBalancesUpdate, onTransactionsUpdate }: ConvertModalProps) => {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const availableBalance = balances.find(b => b.currency === fromCurrency)?.amount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (fromCurrency === toCurrency) {
      toast({
        title: "Invalid conversion",
        description: "Source and target currencies must be different",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      toast({
        title: "Insufficient funds",
        description: `You only have ${availableBalance} ${fromCurrency} available`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const response = await ZadexApi.convert(userData.user_id, fromCurrency, toCurrency, parseFloat(amount));
      
      if (response.success) {
        toast({
          title: "Conversion successful",
          description: `Converted ${amount} ${fromCurrency} to ${toCurrency}`,
        });
        onBalancesUpdate();
        onTransactionsUpdate();
        onOpenChange(false);
        setAmount("");
      } else {
        throw new Error(response.error || 'Conversion failed');
      }
    } catch (error: any) {
      toast({
        title: "Conversion failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Convert Currency</DialogTitle>
          <DialogDescription className="text-slate-300">
            Convert between different currencies
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromCurrency">From Currency</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {balances.map((balance) => (
                  <SelectItem key={balance.currency} value={balance.currency}>
                    {balance.currency} ({balance.amount.toFixed(2)} available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="toCurrency">To Currency</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="ILS">ILS</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-slate-700 border-slate-600"
              step="0.01"
              min="0"
              max={availableBalance}
            />
            <div className="text-sm text-slate-400">
              Available: {availableBalance.toFixed(2)} {fromCurrency}
            </div>
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertModal;
