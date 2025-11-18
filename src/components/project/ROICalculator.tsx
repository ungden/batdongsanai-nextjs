"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Home, DollarSign, PiggyBank, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

interface ROICalculatorProps {
  pricePerSqm: number;
  averageRentalPrice?: string;
  rentalYield?: number;
  projectName: string;
}

const ROICalculator = ({ 
  pricePerSqm, 
  averageRentalPrice,
  rentalYield,
  projectName 
}: ROICalculatorProps) => {
  const [area, setArea] = useState(70);
  const [downPayment, setDownPayment] = useState(30);
  const [loanTerm, setLoanTerm] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [investmentPeriod, setInvestmentPeriod] = useState(5);
  const [priceGrowth, setPriceGrowth] = useState(5);
  const [scenario, setScenario] = useState<"buy-to-live" | "buy-to-rent" | "buy-to-flip">("buy-to-rent");

  // Calculations
  const totalPrice = pricePerSqm * area;
  const downPaymentAmount = (totalPrice * downPayment) / 100;
  const loanAmount = totalPrice - downPaymentAmount;
  
  // Monthly payment calculation (PMT formula)
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Rental income (parse from range)
  const rentalIncome = averageRentalPrice 
    ? (parseInt(averageRentalPrice.split('-')[0]) + parseInt(averageRentalPrice.split('-')[1])) / 2 * 1000000
    : (totalPrice * (rentalYield || 5) / 100) / 12;
  
  // Future value
  const futureValue = totalPrice * Math.pow(1 + priceGrowth / 100, investmentPeriod);
  const capitalGain = futureValue - totalPrice;
  
  // Total rental income over period
  const totalRentalIncome = rentalIncome * 12 * investmentPeriod;
  
  // Net cash flow
  const totalLoanPayment = monthlyPayment * 12 * investmentPeriod;
  const netCashFlow = totalRentalIncome - totalLoanPayment;
  
  // ROI calculation
  const totalReturn = capitalGain + netCashFlow;
  const roi = (totalReturn / downPaymentAmount) * 100;
  const annualizedROI = roi / investmentPeriod;

  // Generate cash flow data for chart
  const cashFlowData = [];
  for (let year = 1; year <= investmentPeriod; year++) {
    const yearlyRental = rentalIncome * 12;
    const yearlyLoan = monthlyPayment * 12;
    const yearlyNet = yearlyRental - yearlyLoan;
    const cumulativeNet = yearlyNet * year;
    
    cashFlowData.push({
      year: `Năm ${year}`,
      rental: yearlyRental / 1000000,
      loan: yearlyLoan / 1000000,
      net: yearlyNet / 1000000,
      cumulative: cumulativeNet / 1000000
    });
  }

  // Comparison with other investments
  const stockMarketReturn = downPaymentAmount * Math.pow(1.12, investmentPeriod); // 12% annual
  const goldReturn = downPaymentAmount * Math.pow(1.08, investmentPeriod); // 8% annual
  const savingsReturn = downPaymentAmount * Math.pow(1.05, investmentPeriod); // 5% annual
  
  const comparisonData = [
    { name: 'BĐS', value: (downPaymentAmount + totalReturn) / 1000000000, color: '#2563eb' },
    { name: 'Chứng khoán', value: stockMarketReturn / 1000000000, color: '#10b981' },
    { name: 'Vàng', value: goldReturn / 1000000000, color: '#f59e0b' },
    { name: 'Tiết kiệm', value: savingsReturn / 1000000000, color: '#64748b' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatBillion = (value: number) => {
    return `${(value / 1000000000).toFixed(2)} tỷ`;
  };

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Tính toán ROI & Phân tích đầu tư
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Scenario Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Kịch bản đầu tư</Label>
          <Tabs value={scenario} onValueChange={(v) => setScenario(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger value="buy-to-live" className="rounded-lg">
                <Home className="w-4 h-4 mr-2" />
                Mua để ở
              </TabsTrigger>
              <TabsTrigger value="buy-to-rent" className="rounded-lg">
                <DollarSign className="w-4 h-4 mr-2" />
                Mua cho thuê
              </TabsTrigger>
              <TabsTrigger value="buy-to-flip" className="rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                Đầu tư ngắn hạn
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium">Diện tích (m²)</Label>
            <Input
              id="area"
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="downPayment" className="text-sm font-medium">Trả trước (%)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loanTerm" className="text-sm font-medium">Thời hạn vay (năm)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-sm font-medium">Lãi suất (%/năm)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="investmentPeriod" className="text-sm font-medium">Thời gian nắm giữ (năm)</Label>
            <Input
              id="investmentPeriod"
              type="number"
              value={investmentPeriod}
              onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priceGrowth" className="text-sm font-medium">Tăng giá dự kiến (%/năm)</Label>
            <Input
              id="priceGrowth"
              type="number"
              step="0.1"
              value={priceGrowth}
              onChange={(e) => setPriceGrowth(Number(e.target.value))}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Key Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">Tổng giá trị</div>
            <div className="text-lg font-bold text-slate-900">
              {formatBillion(totalPrice)}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">Vốn ban đầu</div>
            <div className="text-lg font-bold text-emerald-600">
              {formatBillion(downPaymentAmount)}
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">ROI</div>
            <div className="text-lg font-bold text-amber-600">
              {roi.toFixed(1)}%
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="text-xs text-slate-600 mb-1 font-medium">ROI/năm</div>
            <div className="text-lg font-bold text-purple-600">
              {annualizedROI.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Chi tiết tài chính</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-700">Trả góp hàng tháng</span>
              <span className="font-bold text-slate-900">{formatCurrency(monthlyPayment)}</span>
            </div>
            
            {scenario === "buy-to-rent" && (
              <div className="flex justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm text-slate-700">Thu nhập thuê/tháng</span>
                <span className="font-bold text-emerald-600">{formatCurrency(rentalIncome)}</span>
              </div>
            )}
            
            <div className="flex justify-between p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-slate-700">Giá trị sau {investmentPeriod} năm</span>
              <span className="font-bold text-blue-600">{formatBillion(futureValue)}</span>
            </div>
            
            <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
              <span className="text-sm text-slate-700">Lợi nhuận vốn</span>
              <span className="font-bold text-purple-600">{formatBillion(capitalGain)}</span>
            </div>
            
            {scenario === "buy-to-rent" && (
              <>
                <div className="flex justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm text-slate-700">Tổng thu nhập thuê</span>
                  <span className="font-bold text-amber-600">{formatBillion(totalRentalIncome)}</span>
                </div>
                
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-700">Tổng trả ngân hàng</span>
                  <span className="font-bold text-slate-900">{formatBillion(totalLoanPayment)}</span>
                </div>
                
                <div className="flex justify-between p-3 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                  <span className="text-sm font-semibold text-slate-700">Cash flow ròng</span>
                  <span className="font-bold text-emerald-600">{formatBillion(netCashFlow)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border-2 border-primary/30">
              <span className="font-semibold text-slate-900">Tổng lợi nhuận</span>
              <span className="font-bold text-xl text-primary">{formatBillion(totalReturn)}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Chart */}
        {scenario === "buy-to-rent" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Dòng tiền theo năm</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}M`}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="rental" fill="#10b981" name="Thu nhập thuê" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="loan" fill="#ef4444" name="Trả ngân hàng" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="net" fill="#2563eb" name="Cash flow ròng" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Investment Comparison */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">So sánh với kênh đầu tư khác</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} tỷ`}
                  contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">Lưu ý quan trọng</div>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Các con số trên chỉ mang tính chất tham khảo. ROI thực tế phụ thuộc vào nhiều yếu tố như: 
                  vị trí, thời điểm mua/bán, chi phí phát sinh, thuế, và biến động thị trường. 
                  Nên tham khảo ý kiến chuyên gia trước khi đầu tư.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROICalculator;