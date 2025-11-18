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

  const combinedData = [...chartData, ...forecast];

  const formatPrice = (value: number) => `${value.toFixed(1)}M`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-primary/20">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].payload.date}</p>
          {payload[0].payload.price && (
            <p className="text-sm text-primary font-bold">
              Giá thực tế: {payload[0].payload.priceLabel}
            </p>
          )}
          {payload[0].payload.forecast && (
            <p className="text-sm text-amber-600 font-bold">
              Dự báo: {payload[0].payload.forecastLabel}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Lịch sử giá & Dự báo
          </CardTitle>
          <Badge 
            className={`${
              isPositive 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-red-100 text-red-700 border-red-200'
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
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">Giá mở bán</div>
            <div className="text-xl font-bold text-slate-900">
              {(firstPrice / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">Giá hiện tại</div>
            <div className="text-xl font-bold text-emerald-600">
              {(currentPrice / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">Tăng trưởng</div>
            <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{(priceChange / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">TB tháng</div>
            <div className="text-xl font-bold text-purple-600">
              +{avgMonthlyGrowth}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* Actual price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 5 }}
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
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-900 mb-1">Phân tích xu hướng</div>
              <p className="text-sm text-blue-700 leading-relaxed">
                Giá {projectName} đã {isPositive ? 'tăng' : 'giảm'} <span className="font-bold">{Math.abs(parseFloat(priceChangePercent))}%</span> kể từ khi mở bán.
                Với tốc độ tăng trưởng trung bình <span className="font-bold">{avgMonthlyGrowth}%/tháng</span>, 
                dự báo giá sẽ đạt <span className="font-bold">{(forecast[forecastMonths - 1]?.forecast || 0).toFixed(1)}M VNĐ/m²</span> trong 6 tháng tới.
                {isPositive && parseFloat(avgMonthlyGrowth) > 1 && (
                  <span className="block mt-2 text-emerald-700 font-semibold">
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