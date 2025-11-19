import { useState, useEffect } from "react";
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

const Calculator = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  
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
    
    setResults({
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPaymentAmount: price * downPercent / 100,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const content = (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
           <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
             <CalculatorIcon className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-3xl font-black text-foreground">Tính toán khoản vay</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Lập kế hoạch tài chính chi tiết cho ngôi nhà tương lai của bạn</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <Card className="lg:col-span-3 rounded-3xl shadow-lg border-border bg-card overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Thông tin khoản vay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
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

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="text-sm text-slate-300 mb-2 font-medium uppercase tracking-wide">Thanh toán hàng tháng</div>
                    <div className="text-4xl font-black text-white tracking-tight">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                       <div>
                         <div className="text-xs text-slate-400 mb-1">Trả trước</div>
                         <div className="text-lg font-bold text-emerald-400">{formatCurrency(results.downPaymentAmount)}</div>
                       </div>
                       <div>
                         <div className="text-xs text-slate-400 mb-1">Gốc vay</div>
                         <div className="text-lg font-bold text-blue-400">{formatCurrency(results.loanAmount)}</div>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <PieChart className="w-5 h-5 text-primary" />
                      Tổng quan chi phí
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tổng gốc + lãi:</span>
                      <span className="font-bold text-foreground">{formatCurrency(results.totalPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tổng lãi phải trả:</span>
                      <span className="font-bold text-amber-500">{formatCurrency(results.totalInterest)}</span>
                    </div>
                    
                    {formData.monthlyIncome && (
                      <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                        (results.monthlyPayment / parseFloat(formData.monthlyIncome)) > 0.5 
                          ? "bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900"
                      }`}>
                        <span>Tỷ lệ nợ/thu nhập:</span>
                        <span className="font-bold">
                          {((results.monthlyPayment / parseFloat(formData.monthlyIncome)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button variant="outline" className="w-full h-12 rounded-xl border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
                  <Download className="w-4 h-4 mr-2" />
                  Tải bảng tính chi tiết
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/30 rounded-3xl border-2 border-dashed border-border min-h-[300px]">
                <CalculatorIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium">Nhập thông tin bên trái để xem kết quả</p>
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