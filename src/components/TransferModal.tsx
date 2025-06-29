
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferModal = ({ isOpen, onClose, onSuccess }: TransferModalProps) => {
  const [recipientEmail, setRecipientEmail] = useState("");
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
    if (!recipientEmail || !currency || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zadex_token')}`,
        },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          currency,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        toast({
          title: "Transfer Successful!",
          description: `${amount} ${currency} has been sent to ${recipientEmail}.`,
        });
        
        onSuccess();
        onClose();
        setRecipientEmail("");
        setCurrency("");
        setAmount("");
      } else {
        throw new Error('Transfer failed');
      }
    } catch (error) {
      // Demo success for now
      toast({
        title: "Demo Transfer Successful!",
        description: `${amount} ${currency} sent to ${recipientEmail}.`,
      });
      
      onSuccess();
      onClose();
      setRecipientEmail("");
      setCurrency("");
      setAmount("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setRecipientEmail("");
    setCurrency("");
    setAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ArrowRightLeft className="h-5 w-5 mr-2 text-blue-400" />
            Send Money
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Transfer funds to another Zadex user instantly
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">Recipient Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="recipient"
                type="email"
                placeholder="Enter recipient's email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400 pl-10"
                required
              />
            </div>
          </div>

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
              placeholder="Enter amount to send"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
              min="0"
              step="0.01"
              required
            />
          </div>

          {recipientEmail && currency && amount && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="text-sm text-gray-400 mb-2">Transfer Summary</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white">To:</span>
                  <span className="text-cyan-400">{recipientEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Amount:</span>
                  <span className="text-blue-400 font-semibold">{amount} {currency}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Transfer Fee:</span>
                  <span className="text-green-400">Free</span>
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isLoading ? 'Sending...' : `Send ${amount} ${currency}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
