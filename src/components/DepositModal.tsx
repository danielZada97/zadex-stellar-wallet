import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";
import { Loader2 } from "lucide-react";

interface Balance {
  currency: string;
  amount: number;
}

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: Balance[];
  onBalancesUpdate: () => void;
  onTransactionsUpdate: () => void;
}

const DepositModal = ({
  open,
  onOpenChange,
  balances,
  onBalancesUpdate,
  onTransactionsUpdate,
}: DepositModalProps) => {
  const [currency, setCurrency] = useState("ILS");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const response = await ZadexApi.deposit(
        userData.user_id,
        currency,
        parseFloat(amount)
      );

      if (response.success) {
        toast({
          title: "Deposit successful",
          description: `Deposited ${amount} ${currency}`,
        });
        onBalancesUpdate();
        onTransactionsUpdate();
        onOpenChange(false);
        setAmount("");
      } else {
        throw new Error(response.error || "Deposit failed");
      }
    } catch (error: any) {
      toast({
        title: "Deposit failed",
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
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription className="text-slate-300">
            Add funds to your wallet
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
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
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deposit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
