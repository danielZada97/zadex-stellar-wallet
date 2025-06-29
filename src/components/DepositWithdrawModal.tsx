
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deposit' | 'withdraw';
  onSuccess: (type: 'deposit' | 'withdraw', amount: number, currency: string) => void;
  currentBalances: Record<string, number>;
}

const DepositWithdrawModal = ({ isOpen, onClose, type, onSuccess, currentBalances }: DepositWithdrawModalProps) => {
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },  
    { value: "ILS", label: "ILS - Israeli Shekel" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currency || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a currency and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    
    // Check if user has sufficient balance for withdrawal
    if (type === 'withdraw') {
      const currentBalance = currentBalances[currency] || 0;
      if (numAmount > currentBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You only have ${currentBalance.toFixed(2)} ${currency} available.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem('zadex_user') || '{}');

    try {
      let response;
      if (type === 'deposit') {
        response = await ZadexApi.deposit(user.user_id, currency, numAmount);
      } else {
        response = await ZadexApi.withdraw(user.user_id, currency, numAmount);
      }
      
      if (response.success) {
        onSuccess(type, numAmount, currency);
        onClose();
        setCurrency("");
        setAmount("");
      } else {
        throw new Error(response.message || `${type} failed`);
      }
    } catch (error) {
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Failed`,
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrency("");
    setAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {type === 'deposit' ? (
              <Plus className="h-5 w-5 mr-2 text-green-400" />
            ) : (
              <Minus className="h-5 w-5 mr-2 text-red-400" />
            )}
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {type === 'deposit' 
              ? 'Add funds to your Zadex wallet' 
              : 'Withdraw funds from your Zadex wallet'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-gray-300">Currency</Label>
            <Select value={currency} onValueChange={setCurrency} required>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value} className="text-white hover:bg-slate-700">
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
              min="0"
              step="0.01"
              required
            />
            {type === 'withdraw' && currency && (
              <div className="text-sm text-gray-400">
                Available: {(currentBalances[currency] || 0).toFixed(2)} {currency}
              </div>
            )}
          </div>

          {currency && amount && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="text-sm text-gray-400 mb-2">Transaction Summary</div>
              <div className="flex justify-between items-center">
                <span className="text-white">
                  {type === 'deposit' ? 'Adding to wallet:' : 'Withdrawing from wallet:'}
                </span>
                <span className={`font-semibold ${type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                  {type === 'deposit' ? '+' : '-'}{amount} {currency}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex-1 ${
                type === 'deposit' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
              } text-white`}
            >
              {isLoading ? 'Processing...' : `${type === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount} ${currency}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositWithdrawModal;
