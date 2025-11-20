import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calculator as CalculatorIcon, Download, TrendingUp, DollarSign, Sparkles, PieChart } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ShareResultButton } from "@/components/calculator/ShareResultButton";

const Calculator = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    propertyPrice: "",
    downPayment: "30",
    loanAmount: "",
    interestRate: "8.5",
    loanTerm: "20",
    monthlyIncome: "",
  });

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const price = searchParams.get("price");
    const area = searchParams.get("area");
    
    if (price) {
      if (area && parseFloat(price) < 1000000000) {
         const total = parseFloat(price) * parseFloat(area);
         setFormData(prev => ({ ...prev, propertyPrice: total.toString() }));
      } else {
         setFormData(prev => ({ ...prev, propertyPrice: price }));
      }
    }
  }, [searchParams]);

  const calculateLoan = () => {
    const price = parseFloat(formData.propertyPrice);
    const downPercent = parseFloat(formData.downPayment);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const term = parseFloat(formData.loanTerm) * 12;
    
    const loanAmount = price * (1 - downPercent / 100);
    const monthlyPayment = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - loanAmount;
    const downPaymentAmount = price * downPercent / 100;
    
    setResults({
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPaymentAmount,
      originalPrice: price
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pieData = results ? [
    { name: 'Gốc vay', value: results.loanAmount, color: '#3b82f6' }, // blue-500
    { name: 'Lãi phải trả', value: results.totalInterest, color: '#f59e0b' }, // amber-500
    { name: 'Vốn tự có', value: results.downPaymentAmount, color: '#10b981' }, // emerald-500
  ] : [];

  const content = (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
        <div className="text-center space-y-2 mb-8">
           <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
             <CalculatorIcon className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-3xl font-black text-foreground">Tính toán khoản vay</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Lập kế hoạch tài chính chi tiết cho ngôi nhà tương lai của bạn</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Form - Takes 5 columns on large screens */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl shadow-lg border-border bg-card overflow-hidden h-full">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Thông số đầu vào
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyPrice" className="text-foreground font-medium">Giá trị bất động sản (VNĐ)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="propertyPrice"
                        type="number"
                        placeholder="3.000.000.000"
                        value={formData.propertyPrice}
                        onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                        className="h-12 pl-10 text-lg font-semibold rounded-xl border-input focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="downPayment" className="text-foreground font-medium">Trả trước (%)</Label>
                      <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                        <SelectTrigger className="h-12 rounded-xl border-input bg-background focus:bg-accent transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="30">30%</SelectItem>
                          <SelectItem value="40">40%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="70">70%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanTerm" className="text-foreground font-medium">Thời hạn (năm)</Label>
                      <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                        <SelectTrigger className="h-12 rounded-xl border-input bg-background focus:bg-accent transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 năm</SelectItem>
                          <SelectItem value="10">10 năm</SelectItem>
                          <SelectItem value="15">15 năm</SelectItem>
                          <SelectItem value="20">20 năm</SelectItem>
                          <SelectItem value="25">25 năm</SelectItem>
                          <SelectItem value="30">30 năm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate" className="text-foreground font-medium">Lãi suất ưu đãi (%/năm)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="h-12 rounded-xl border-input bg-background focus:bg-accent transition-all"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="monthlyIncome" className="text-foreground font-medium">Thu nhập hàng tháng (Tùy chọn)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="50.000.000"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      className="h-12 rounded-xl border-input"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateLoan} 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700 text-white mt-4" 
                  disabled={!formData.propertyPrice}
                >
                  Tính toán ngay
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel - Takes 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            {results ? (
              <div className="space-y-6 animate-fade-in">
                {/* Shareable Result Container */}
                <div ref={resultsRef} className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-xl border border-border/50 relative overflow-hidden">
                  {/* Gradient Background Effect */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-bold text-foreground">Kết quả tính toán</h3>
                    <p className="text-sm text-muted-foreground">Dự toán tài chính chi tiết</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-center">
                     {/* Main Number */}
                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg text-center">
                        <div className="text-sm text-slate-300 mb-2 uppercase tracking-wide font-medium">Trả hàng tháng</div>
                        <div className="text-3xl font-black tracking-tight">
                          {formatCurrency(results.monthlyPayment)}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-left">
                           <div>
                             <div className="text-slate-400">Gốc vay</div>
                             <div className="font-bold">{formatCurrency(results.loanAmount)}</div>
                           </div>
                           <div>
                             <div className="text-slate-400">Lãi suất</div>
                             <div className="font-bold">{formData.interestRate}%/năm</div>
                           </div>
                        </div>
                     </div>

                     {/* Chart */}
                     <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                             <div className="text-xs text-muted-foreground">Tổng chi phí</div>
                             <div className="font-bold text-sm text-foreground">{formatCurrency(results.totalPayment + results.downPaymentAmount)}</div>
                          </div>
                        </div>
                     </div>
                  </div>

                  {/* Details Table */}
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-emerald-500" />
                         <span className="text-sm font-medium">Vốn tự có ({formData.downPayment}%)</span>
                       </div>
                       <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(results.downPaymentAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-blue-500" />
                         <span className="text-sm font-medium">Gốc vay ({100 - parseInt(formData.downPayment)}%)</span>
                       </div>
                       <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(results.loanAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-amber-500" />
                         <span className="text-sm font-medium">Tổng lãi phải trả</span>
                       </div>
                       <span className="font-bold text-amber-600 dark:text-amber-500">{formatCurrency(results.totalInterest)}</span>
                    </div>
                  </div>

                  {formData.monthlyIncome && (
                    <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
                      (results.monthlyPayment / parseFloat(formData.monthlyIncome)) > 0.5 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Tỷ lệ nợ/thu nhập:
                      </span>
                      <span className="font-bold text-lg">
                        {((results.monthlyPayment / parseFloat(formData.monthlyIncome)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <ShareResultButton targetRef={resultsRef} />
                  
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Tải PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border-2 border-dashed border-border min-h-[400px]">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <CalculatorIcon className="w-12 h-12 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Chưa có kết quả</h3>
                <p className="max-w-xs mx-auto">Nhập thông tin tài chính vào bảng bên trái và bấm "Tính toán ngay" để xem kết quả chi tiết.</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border p-4 shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-foreground">Tính toán khoản vay</h1>
        </div>
        <div className="p-4">
          {content}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout 
      title="Tính toán dòng tiền" 
      subtitle="Công cụ lập kế hoạch tài chính"
    >
      {content}
    </DesktopLayout>
  );
};

export default Calculator;