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
import { Calculator as CalculatorIcon, Download, TrendingUp, DollarSign, Sparkles } from "lucide-react";

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

  // Effect to pre-fill data from URL params
  useEffect(() => {
    const price = searchParams.get("price");
    const area = searchParams.get("area");
    
    if (price) {
      // If price is per sqm and area is provided, calculate total
      if (area && parseFloat(price) < 1000000000) { // Heuristic: if price < 1 billion, likely per sqm
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
    }).format(amount);
  };

  const content = (
    <div className="space-y-6">
        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 rounded-t-2xl border-b border-border/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Thông tin căn hộ & tài chính
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="propertyPrice" className="text-sm font-semibold text-muted-foreground">Giá trị căn hộ (VNĐ)</Label>
                <Input
                  id="propertyPrice"
                  type="number"
                  placeholder="3000000000"
                  value={formData.propertyPrice}
                  onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment" className="text-sm font-semibold text-muted-foreground">Trả trước (%)</Label>
                <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-sm font-semibold text-muted-foreground">Lãi suất (%/năm)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanTerm" className="text-sm font-semibold text-muted-foreground">Thời hạn vay (năm)</Label>
                <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10 năm</SelectItem>
                    <SelectItem value="15">15 năm</SelectItem>
                    <SelectItem value="20">20 năm</SelectItem>
                    <SelectItem value="25">25 năm</SelectItem>
                    <SelectItem value="30">30 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-muted-foreground">Thu nhập hàng tháng (VNĐ)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="50000000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary bg-background"
                />
              </div>
            </div>

            <Button 
              onClick={calculateLoan} 
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all btn-primary" 
              disabled={!formData.propertyPrice}
            >
              <CalculatorIcon className="w-5 h-5 mr-2" />
              Tính toán dòng tiền
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">Trả hàng tháng</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">Trả trước</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(results.downPaymentAmount)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-lg border-0 bg-card">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 rounded-t-2xl border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Chi tiết khoản vay
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Số tiền vay:</span>
                  <span className="font-bold text-foreground">{formatCurrency(results.loanAmount)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Tổng tiền phải trả:</span>
                  <span className="font-bold text-foreground">{formatCurrency(results.totalPayment)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Tổng tiền lãi:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-500">{formatCurrency(results.totalInterest)}</span>
                </div>
                
                {formData.monthlyIncome && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 rounded-xl">
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-muted-foreground font-medium">Tỷ lệ trả nợ/thu nhập:</span>
                      <span className={`font-bold ${
                        (results.monthlyPayment / parseFloat(formData.monthlyIncome)) > 0.5 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {((results.monthlyPayment / parseFloat(formData.monthlyIncome)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Khuyến nghị: Dưới 50% thu nhập
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full h-12 rounded-xl border-2 hover:bg-accent transition-all">
              <Download className="w-4 h-4 mr-2" />
              Tải xuống bảng tính
            </Button>
          </div>
        )}
      </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                <CalculatorIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tính toán dòng tiền</h1>
                <p className="text-muted-foreground text-sm mt-1">Tính toán chi phí và khả năng thanh toán</p>
              </div>
            </div>
          </div>
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
      subtitle="Tính toán chi phí và khả năng thanh toán"
    >
      {content}
    </DesktopLayout>
  );
};

export default Calculator;