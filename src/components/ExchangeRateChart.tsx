import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { exchangeRatesService } from "@/services/exchangeRatesService";

interface ChartData {
  date: string;
  rate: number;
  currency: string;
}

const ExchangeRateChart = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencies = [
    { value: "EUR", label: "EUR to ILS" },
    { value: "GBP", label: "GBP to ILS" },
    { value: "JPY", label: "JPY to ILS" },
  ];

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const historicalRates = await exchangeRatesService.getHistoricalRates(
          selectedCurrency,
          30
        );
        const data = historicalRates.map((item) => ({
          date: item.date,
          rate: item.rate,
          currency: selectedCurrency,
        }));

        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
        setError("Failed to load exchange rate data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedCurrency]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`Date: ${label}`}</p>
          <p className="text-cyan-400 font-semibold">
            {`Rate: ${payload[0].value} ${selectedCurrency}/ILS`}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
            Exchange Rate Chart
            {isLoading && (
              <span className="text-cyan-400 text-sm ml-2">(Loading...)</span>
            )}
          </CardTitle>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {currencies.map((currency) => (
                <SelectItem
                  key={currency.value}
                  value={currency.value}
                  className="text-white hover:bg-slate-700"
                >
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
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
                  domain={["dataMin - 0.01", "dataMax + 0.01"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ fill: "#06B6D4", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#06B6D4", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="text-gray-400">30-day trend</span>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Current Rate:</span>
            <span className="text-cyan-400 font-semibold">
              {chartData.length > 0
                ? chartData[chartData.length - 1].rate
                : "Loading..."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateChart;
