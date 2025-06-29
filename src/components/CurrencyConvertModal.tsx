
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";

interface CurrencyConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalances: Record<string, number>;
}

const CurrencyConvertModal = ({ isOpen, onClose, onSuccess, currentBalances }: CurrencyConvertModalProps) => {
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
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
    if (!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    if (fromCurrency === toCurrency) {
      toast({
        title: "Invalid Conversion",
        description: "Cannot convert to the same currency.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    const currentBalance = currentBalances[fromCurrency] || 0;
    
    if (numAmount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${currentBalance.toFixed(2)} ${fromCurrency} available.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem('zadex_user') || '{}');

    try {
      const response = await ZadexApi.convert(user.user_id, fromCurrency, toCurrency, numAmount);
      
      if (response.success) {
        toast({
          title: "Conversion Successful!",
          description: `${amount} ${fromCurrency} has been converted to ${toCurrency}.`,
        });
        
        onSuccess();
        onClose();
        setFromCurrency("");
        setToCurrency("");
        setAmount("");
      } else {
        throw new Error(response.message || 'Conversion failed');
      }
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFromCurrency("");
    setToCurrency("");
    setAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ArrowRightLeft className="h-5 w-5 mr-2 text-purple-400" />
            Convert Currency
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Convert between different currencies in your wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-currency" className="text-gray-300">From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency} required>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select from" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value} className="text-white hover:bg-slate-700">
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromCurrency && (
                <div className="text-sm text-gray-400">
                  Available: {(currentBalances[fromCurrency] || 0).toFixed(2)} {fromCurrency}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-currency" className="text-gray-300">To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency} required>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select to" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">Amount to Convert</Label>
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
          </div>

          {fromCurrency && toCurrency && amount && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="text-sm text-gray-400 mb-2">Conversion Summary</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white">Converting:</span>
                  <span className="text-red-400">{amount} {fromCurrency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">To receive:</span>
                  <span className="text-green-400">~{toCurrency} (rate applied)</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isLoading ? 'Converting...' : `Convert ${amount} ${fromCurrency}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyConvertModal;
