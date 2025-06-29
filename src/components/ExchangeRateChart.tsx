
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ChartData {
  date: string;
  rate: number;
  currency: string;
}

const ExchangeRateChart = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const currencies = [
    { value: "EUR", label: "EUR to USD" },
    { value: "ILS", label: "ILS to USD" },
    { value: "GBP", label: "GBP to USD" },
    { value: "JPY", label: "JPY to USD" },
  ];

  useEffect(() => {
    // Generate demo data - replace with actual API call
    const generateDemoData = () => {
      const data = [];
      const baseRate = selectedCurrency === "EUR" ? 0.85 : 
                      selectedCurrency === "ILS" ? 3.7 :
                      selectedCurrency === "GBP" ? 0.73 : 110;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.1;
        const rate = baseRate + (baseRate * variation);
        
        data.push({
          date: date.toISOString().split('T')[0],
          rate: Number(rate.toFixed(4)),
          currency: selectedCurrency,
        });
      }
      return data;
    };

    setChartData(generateDemoData());
  }, [selectedCurrency]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Date: ${label}`}</p>
          <p className="text-cyan-400 font-semibold">
            {`Rate: ${payload[0].value} ${selectedCurrency}/USD`}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
            Exchange Rate Chart
          </CardTitle>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value} className="text-white hover:bg-slate-700">
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#06B6D4" 
                strokeWidth={2}
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="text-gray-400">30-day trend</span>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Current Rate:</span>
            <span className="text-cyan-400 font-semibold">
              {chartData.length > 0 ? chartData[chartData.length - 1].rate : 'Loading...'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateChart;
