import { useState } from "react";
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
  const [formData, setFormData] = useState({
    propertyPrice: "",
    downPayment: "30",
    loanAmount: "",
    interestRate: "8.5",
    loanTerm: "20",
    monthlyIncome: "",
  });

  const [results, setResults] = useState<any>(null);

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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-20">
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                <CalculatorIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tính toán dòng tiền</h1>
                <p className="text-slate-600 text-sm mt-1">Tính toán chi phí và khả năng thanh toán</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                <Sparkles className="w-5 h-5 text-primary" />
                Thông tin căn hộ & tài chính
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="propertyPrice" className="text-sm font-semibold text-slate-700">Giá trị căn hộ (VNĐ)</Label>
                <Input
                  id="propertyPrice"
                  type="number"
                  placeholder="3000000000"
                  value={formData.propertyPrice}
                  onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment" className="text-sm font-semibold text-slate-700">Trả trước (%)</Label>
                <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
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
                <Label htmlFor="interestRate" className="text-sm font-semibold text-slate-700">Lãi suất (%/năm)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanTerm" className="text-sm font-semibold text-slate-700">Thời hạn vay (năm)</Label>
                <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
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

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-slate-700">Thu nhập hàng tháng (VNĐ)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="50000000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>

              <Button 
                onClick={calculateLoan} 
                className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
                disabled={!formData.propertyPrice}
              >
                <CalculatorIcon className="w-5 h-5 mr-2" />
                Tính toán dòng tiền
              </Button>
            </CardContent>
          </Card>

          {results && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2 font-medium">Trả hàng tháng</div>
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {formatCurrency(results.monthlyPayment)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-2 font-medium">Trả trước</div>
                      <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                        {formatCurrency(results.downPaymentAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <div className="p-1.5 bg-primary/10 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    Chi tiết khoản vay
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-slate-600">Số tiền vay:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(results.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-slate-600">Tổng tiền phải trả:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(results.totalPayment)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-slate-600">Tổng tiền lãi:</span>
                    <span className="font-bold text-amber-600">{formatCurrency(results.totalInterest)}</span>
                  </div>
                  
                  {formData.monthlyIncome && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
                      <div className="flex justify-between text-base mb-2">
                        <span className="text-slate-700 font-medium">Tỷ lệ trả nợ/thu nhập:</span>
                        <span className={`font-bold ${
                          (results.monthlyPayment / parseFloat(formData.monthlyIncome)) > 0.5 
                            ? "text-red-600" 
                            : "text-emerald-600"
                        }`}>
                          {((results.monthlyPayment / parseFloat(formData.monthlyIncome)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Khuyến nghị: Dưới 50% thu nhập
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full h-12 rounded-xl border-2 hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống bảng tính
              </Button>
            </div>
          )}
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
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <Sparkles className="w-5 h-5 text-primary" />
              Thông tin căn hộ & tài chính
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="propertyPrice" className="text-sm font-semibold text-slate-700">Giá trị căn hộ (VNĐ)</Label>
                <Input
                  id="propertyPrice"
                  type="number"
                  placeholder="3000000000"
                  value={formData.propertyPrice}
                  onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPayment" className="text-sm font-semibold text-slate-700">Trả trước (%)</Label>
                <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
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
                <Label htmlFor="interestRate" className="text-sm font-semibold text-slate-700">Lãi suất (%/năm)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanTerm" className="text-sm font-semibold text-slate-700">Thời hạn vay (năm)</Label>
                <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                  <SelectTrigger className="h-12 rounded-xl border-2">
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
                <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-slate-700">Thu nhập hàng tháng (VNĐ)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="50000000"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="h-12 rounded-xl border-2 focus:border-primary"
                />
              </div>
            </div>

            <Button 
              onClick={calculateLoan} 
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={!formData.propertyPrice}
            >
              <CalculatorIcon className="w-5 h-5 mr-2" />
              Tính toán dòng tiền
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-2 font-medium">Trả hàng tháng</div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-2 font-medium">Trả trước</div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(results.downPaymentAmount)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <div className="p-1.5 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Chi tiết khoản vay
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Số tiền vay:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(results.loanAmount)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Tổng tiền phải trả:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(results.totalPayment)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">Tổng tiền lãi:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(results.totalInterest)}</span>
                </div>
                
                {formData.monthlyIncome && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-slate-700 font-medium">Tỷ lệ trả nợ/thu nhập:</span>
                      <span className={`font-bold ${
                        (results.monthlyPayment / parseFloat(formData.monthlyIncome)) > 0.5 
                          ? "text-red-600" 
                          : "text-emerald-600"
                      }`}>
                        {((results.monthlyPayment / parseFloat(formData.monthlyIncome)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Khuyến nghị: Dưới 50% thu nhập
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full h-12 rounded-xl border-2 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Tải xuống bảng tính
            </Button>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
};

export default Calculator;