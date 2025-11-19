"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface PriceHistoryChartProps {
  priceHistory: Array<{ date: string; price: number }>;
  launchPrice?: number;
  currentPrice: number;
  projectName: string;
}

const PriceHistoryChart = ({ 
  priceHistory, 
  launchPrice, 
  currentPrice,
  projectName 
}: PriceHistoryChartProps) => {
  // Format data for chart
  const chartData = priceHistory.map(item => ({
    date: item.date,
    price: item.price / 1000000, // Convert to millions
    priceLabel: `${(item.price / 1000000).toFixed(1)}M`
  }));

  // Calculate price change
  const firstPrice = priceHistory[0]?.price || launchPrice || currentPrice;
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(1);
  const isPositive = priceChange >= 0;

  // Calculate average monthly growth
  const monthsDiff = priceHistory.length - 1;
  const avgMonthlyGrowth = monthsDiff > 0 
    ? (((currentPrice / firstPrice) ** (1 / monthsDiff) - 1) * 100).toFixed(2)
    : "0";

  // Generate forecast (simple linear projection)
  const lastDate = priceHistory[priceHistory.length - 1];
  const forecastMonths = 6;
  const monthlyGrowthRate = parseFloat(avgMonthlyGrowth) / 100;
  
  const forecast = [];
  if (lastDate) {
    for (let i = 1; i <= forecastMonths; i++) {
      const forecastPrice = currentPrice * Math.pow(1 + monthlyGrowthRate, i);
      const forecastDate = new Date(lastDate.date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      
      forecast.push({
        date: forecastDate.toISOString().slice(0, 7),
        forecast: forecastPrice / 1000000,
        forecastLabel: `${(forecastPrice / 1000000).toFixed(1)}M (dự báo)`
      });
    }
  }

  const combinedData = [...chartData, ...forecast];

  const formatPrice = (value: number) => `${value.toFixed(1)}M`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 rounded-xl shadow-xl border border-border">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.date}</p>
          {payload[0].payload.price && (
            <p className="text-sm text-primary font-bold">
              Giá thực tế: {payload[0].payload.priceLabel}
            </p>
          )}
          {payload[0].payload.forecast && (
            <p className="text-sm text-amber-600 dark:text-amber-500 font-bold">
              Dự báo: {payload[0].payload.forecastLabel}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-card">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-t-2xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="w-5 h-5 text-primary" />
            Lịch sử giá & Dự báo
          </CardTitle>
          <Badge 
            className={`${
              isPositive 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' 
                : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
            } border px-3 py-1 rounded-full font-bold`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? '+' : ''}{priceChangePercent}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Giá mở bán</div>
            <div className="text-xl font-bold text-foreground">
              {(firstPrice / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Giá hiện tại</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {(currentPrice / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Tăng trưởng</div>
            <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{(priceChange / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
            <div className="text-xs text-muted-foreground mb-1 font-medium">TB tháng</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              +{avgMonthlyGrowth}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                tickFormatter={formatPrice}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--foreground))' }}
                iconType="line"
              />
              
              {/* Actual price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 5 }}
                activeDot={{ r: 7 }}
                name="Giá thực tế"
                connectNulls={false}
              />
              
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 5 }}
                activeDot={{ r: 7 }}
                name="Dự báo"
                connectNulls={false}
              />
              
              {/* Reference line for current price */}
              <ReferenceLine 
                y={currentPrice / 1000000} 
                stroke="#10b981" 
                strokeDasharray="3 3"
                label={{ value: 'Giá hiện tại', position: 'right', fill: '#10b981', fontSize: 12 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Note */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Phân tích xu hướng</div>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                Giá {projectName} đã {isPositive ? 'tăng' : 'giảm'} <span className="font-bold">{Math.abs(parseFloat(priceChangePercent))}%</span> kể từ khi mở bán.
                Với tốc độ tăng trưởng trung bình <span className="font-bold">{avgMonthlyGrowth}%/tháng</span>, 
                dự báo giá sẽ đạt <span className="font-bold">{(forecast[forecastMonths - 1]?.forecast || 0).toFixed(1)}M VNĐ/m²</span> trong 6 tháng tới.
                {isPositive && parseFloat(avgMonthlyGrowth) > 1 && (
                  <span className="block mt-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    ✓ Xu hướng tăng giá tích cực, phù hợp cho đầu tư trung và dài hạn.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceHistoryChart;