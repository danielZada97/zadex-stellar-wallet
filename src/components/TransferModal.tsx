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

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: Balance[];
  onBalancesUpdate: () => void;
  onTransactionsUpdate: () => void;
}

const TransferModal = ({
  open,
  onOpenChange,
  balances,
  onBalancesUpdate,
  onTransactionsUpdate,
}: TransferModalProps) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [fromCurrency, setFromCurrency] = useState("ILS");
  const [toCurrency, setToCurrency] = useState("ILS");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const availableBalance =
    balances.find((b) => b.currency === fromCurrency)?.amount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please fill all fields with valid values",
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
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      if (
        recipientEmail.trim().toLowerCase() ===
        (userData.email || "").trim().toLowerCase()
      ) {
        toast({
          title: "Invalid recipient",
          description: "You cannot transfer funds to yourself.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const response = await ZadexApi.transfer(
        userData.user_id,
        recipientEmail,
        fromCurrency,
        toCurrency,
        parseFloat(amount)
      );

      if (response.success) {
        const convertedAmount =
          response.data?.converted_amount || parseFloat(amount);
        const rate = response.data?.rate || 1;

        toast({
          title: "Transfer successful",
          description: `Sent ${amount} ${fromCurrency} (${convertedAmount.toFixed(
            2
          )} ${toCurrency}) to ${recipientEmail}`,
        });
        onBalancesUpdate();
        onTransactionsUpdate();
        onOpenChange(false);
        setRecipientEmail("");
        setAmount("");
      } else {
        throw new Error(
          response.message || response.error || "Transfer failed"
        );
      }
    } catch (error: any) {
      toast({
        title: "Transfer failed",
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
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription className="text-slate-300">
            Send funds to another user
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="bg-slate-700 border-slate-600"
            />
          </div>
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
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
