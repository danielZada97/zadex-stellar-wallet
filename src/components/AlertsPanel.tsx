import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ZadexApi } from "@/services/zadexApi";

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
  const [isLoading, setIsLoading] = useState(true);
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
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem('zadex_user') || '{}');
    
    try {
      const response = await ZadexApi.getAlerts(user.user_id);
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

    const user = JSON.parse(localStorage.getItem('zadex_user') || '{}');

    try {
      const response = await ZadexApi.createAlert(
        user.user_id,
        newAlert.currency,
        parseFloat(newAlert.threshold),
        newAlert.direction
      );

      if (response.success) {
        toast({
          title: "Alert Created!",
          description: `You'll be notified when ${newAlert.currency} goes ${newAlert.direction} ${newAlert.threshold}.`,
        });
        
        // Reload alerts
        await loadAlerts();
        
        setNewAlert({ currency: '', threshold: '', direction: 'above' });
        setShowAddForm(false);
      } else {
        throw new Error(response.message || 'Failed to create alert');
      }
    } catch (error) {
      toast({
        title: "Failed to Create Alert",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      const response = await ZadexApi.deleteAlert(alertId);
      
      if (response.success) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
        toast({
          title: "Alert Deleted",
          description: "The alert has been removed.",
        });
      } else {
        throw new Error(response.message || 'Failed to delete alert');
      }
    } catch (error) {
      toast({
        title: "Failed to Delete Alert",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
            Rate Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-cyan-400">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

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
