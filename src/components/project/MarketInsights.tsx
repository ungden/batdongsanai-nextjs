"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  DollarSign,
  Users,
  Building2,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface MarketInsightsProps {
  city: string;
  district: string;
  pricePerSqm: number;
}

const MarketInsights = ({ city, district, pricePerSqm }: MarketInsightsProps) => {
  // Mock market data - in real app, this would come from market analysis API
  const marketTrends = [
    { month: "T1", avgPrice: 42, supply: 850, demand: 920 },
    { month: "T2", avgPrice: 43, supply: 820, demand: 950 },
    { month: "T3", avgPrice: 44, supply: 800, demand: 980 },
    { month: "T4", avgPrice: 45, supply: 780, demand: 1020 },
    { month: "T5", avgPrice: 46, supply: 750, demand: 1050 },
    { month: "T6", avgPrice: 47, supply: 720, demand: 1100 }
  ];

  const districtComparison = [
    { district: "Quận 1", avgPrice: 120, growth: 8.5 },
    { district: "Quận 2", avgPrice: 65, growth: 12.3 },
    { district: "Quận 7", avgPrice: 55, growth: 10.2 },
    { district: "Quận 9", avgPrice: 45, growth: 15.8 },
    { district: "Bình Thạnh", avgPrice: 52, growth: 9.7 }
  ];

  const marketStats = [
    {
      label: "Giá TB khu vực",
      value: "45M VNĐ/m²",
      change: "+8.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Nguồn cung",
      value: "720 căn",
      change: "-4.2%",
      isPositive: false,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Nhu cầu",
      value: "1,100 người",
      change: "+12.3%",
      isPositive: true,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Tỷ lệ hấp thụ",
      value: "85%",
      change: "+5.8%",
      isPositive: true,
      icon: Activity,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  const pricePosition = ((pricePerSqm / 1000000) / 45) * 100;
  const priceLevel = pricePosition > 110 ? "cao" : pricePosition < 90 ? "thấp" : "trung bình";

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Phân tích thị trường {district}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`p-4 ${stat.bgColor} rounded-xl border border-${stat.color.replace('text-', '')}-200`}>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  <Badge className={`${stat.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} border-0 text-xs`}>
                    {stat.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 mb-1">{stat.label}</div>
                <div className="text-lg font-bold text-slate-900">{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Price Trend Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Xu hướng giá 6 tháng gần đây</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'avgPrice') return [`${value}M VNĐ/m²`, 'Giá TB'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5 }}
                  name="Giá trung bình"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supply vs Demand */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Cung - Cầu thị trường</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="supply" fill="#ef4444" name="Nguồn cung" radius={[8, 8, 0, 0]} />
                <Bar dataKey="demand" fill="#10b981" name="Nhu cầu" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-emerald-900 mb-1">Thị trường đang thiếu hụt nguồn cung</div>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Nhu cầu vượt nguồn cung khoảng 35%, tạo áp lực tăng giá trong ngắn hạn.
                  Đây là tín hiệu tích cực cho nhà đầu tư.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* District Comparison */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">So sánh giá các quận {city}</h3>
          <div className="space-y-2">
            {districtComparison.map((item, index) => (
              <div key={index} className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{item.district}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.avgPrice}M VNĐ/m²</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{item.growth}%
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    style={{ width: `${(item.avgPrice / 120) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Position Analysis */}
        <div className={`p-4 rounded-xl border ${
          priceLevel === "cao" 
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
            : priceLevel === "thấp"
            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <DollarSign className={`w-6 h-6 ${
                priceLevel === "cao" ? "text-amber-600" : priceLevel === "thấp" ? "text-emerald-600" : "text-blue-600"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${
                priceLevel === "cao" ? "text-amber-900" : priceLevel === "thấp" ? "text-emerald-900" : "text-blue-900"
              }`}>
                Vị thế giá dự án
              </h3>
              <p className={`text-sm leading-relaxed ${
                priceLevel === "cao" ? "text-amber-700" : priceLevel === "thấp" ? "text-emerald-700" : "text-blue-700"
              }`}>
                Giá dự án <span className="font-bold">{(pricePerSqm / 1000000).toFixed(1)}M VNĐ/m²</span> đang ở mức{" "}
                <span className="font-bold">{priceLevel}</span> so với giá trung bình khu vực (45M VNĐ/m²).
                {priceLevel === "cao" && " Giá cao hơn trung bình nhưng có thể xứng đáng với chất lượng và vị trí."}
                {priceLevel === "thấp" && " Đây là cơ hội tốt để đầu tư với giá hợp lý."}
                {priceLevel === "trung bình" && " Giá cạnh tranh, phù hợp với thị trường."}
              </p>
            </div>
          </div>
        </div>

        {/* Market Forecast */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">Dự báo thị trường 12 tháng tới</h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Giá dự kiến tăng 8-12% do nguồn cung hạn chế</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Nhu cầu tiếp tục tăng nhờ hạ tầng giao thông phát triển</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Tỷ lệ hấp thụ dự kiến duy trì ở mức cao (80-90%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span>Thanh khoản tốt nhờ vị trí và pháp lý rõ ràng</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 mb-1">Lưu ý</div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Các số liệu và dự báo trên chỉ mang tính chất tham khảo, dựa trên phân tích thị trường hiện tại.
                Thị trường bất động sản có thể biến động theo nhiều yếu tố kinh tế, chính sách.
                Nhà đầu tư nên tham khảo thêm ý kiến chuyên gia trước khi đưa ra quyết định.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;