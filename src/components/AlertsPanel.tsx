
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: number;
  currency: string;
  threshold: number;
  direction: 'above' | 'below';
  is_triggered: boolean;
  created_at: string;
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    currency: '',
    threshold: '',
    direction: 'above' as 'above' | 'below'
  });
  const { toast } = useToast();

  const currencies = [
    { value: "EUR", label: "EUR" },
    { value: "ILS", label: "ILS" },
    { value: "GBP", label: "GBP" },
    { value: "JPY", label: "JPY" },
  ];

  useEffect(() => {
    // Load demo alerts - replace with actual API call
    setAlerts([
      {
        id: 1,
        currency: 'EUR',
        threshold: 0.90,
        direction: 'above',
        is_triggered: false,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        currency: 'ILS',
        threshold: 3.5,
        direction: 'below',
        is_triggered: true,
        created_at: '2024-01-14T15:45:00Z'
      },
      {
        id: 3,
        currency: 'GBP',
        threshold: 0.75,
        direction: 'above',
        is_triggered: false,
        created_at: '2024-01-13T09:15:00Z'
      }
    ]);
  }, []);

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.currency || !newAlert.threshold) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zadex_token')}`,
        },
        body: JSON.stringify({
          currency: newAlert.currency,
          threshold: parseFloat(newAlert.threshold),
          direction: newAlert.direction,
        }),
      });

      if (response.ok) {
        const alertData = await response.json();
        setAlerts([...alerts, alertData]);
      } else {
        throw new Error('Failed to create alert');
      }
    } catch (error) {
      // Demo success for now
      const demoAlert: Alert = {
        id: Date.now(),
        currency: newAlert.currency,
        threshold: parseFloat(newAlert.threshold),
        direction: newAlert.direction,
        is_triggered: false,
        created_at: new Date().toISOString()
      };
      
      setAlerts([...alerts, demoAlert]);
      
      toast({
        title: "Alert Created!",
        description: `You'll be notified when ${newAlert.currency} goes ${newAlert.direction} ${newAlert.threshold}.`,
      });
    }

    setNewAlert({ currency: '', threshold: '', direction: 'above' });
    setShowAddForm(false);
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('zadex_token')}`,
        },
      });
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }

    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert Deleted",
      description: "The alert has been removed.",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
            Rate Alerts
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Alert Form */}
        {showAddForm && (
          <form onSubmit={handleAddAlert} className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alert-currency" className="text-gray-300 text-sm">Currency</Label>
                <Select 
                  value={newAlert.currency} 
                  onValueChange={(value) => setNewAlert({...newAlert, currency: value})}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="alert-direction" className="text-gray-300 text-sm">Direction</Label>
                <Select 
                  value={newAlert.direction} 
                  onValueChange={(value: 'above' | 'below') => setNewAlert({...newAlert, direction: value})}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="above" className="text-white hover:bg-slate-700">Above</SelectItem>
                    <SelectItem value="below" className="text-white hover:bg-slate-700">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-threshold" className="text-gray-300 text-sm">Threshold Rate</Label>
              <Input
                id="alert-threshold"
                type="number"
                placeholder="Enter rate threshold"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({...newAlert, threshold: e.target.value})}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-400"
                step="0.01"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="submit"
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Create Alert
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Active Alerts */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No active alerts. Create one to get notified about rate changes.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.is_triggered 
                    ? 'bg-yellow-500/10 border-yellow-500/50' 
                    : 'bg-slate-700/30 border-slate-600/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-slate-600/50 rounded">
                    {alert.direction === 'above' ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {alert.currency} {alert.direction} {alert.threshold}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {alert.is_triggered && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                      Triggered
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
