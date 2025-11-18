import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, Calculator, DollarSign } from "lucide-react";

interface PaymentCalculatorProps {
  projectPrice: string;
}

const parseVietnamesePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const cleaned = priceStr.toLowerCase().replace(/\s/g, '');
  const numberMatch = cleaned.match(/(\d+\.?\d*)/);
  if (!numberMatch) return 0;
  const number = parseFloat(numberMatch[1]);
  if (cleaned.includes('tỷ')) {
    return number * 1000000000;
  } else if (cleaned.includes('tr')) {
    return number * 1000000;
  }
  return number;
};

const formatNumberInput = (value: number): string => {
  return value.toString();
};

const PaymentCalculator = ({ projectPrice }: PaymentCalculatorProps) => {
  const parsedPrice = parseVietnamesePrice(projectPrice);
  
  const [formData, setFormData] = useState({
    propertyPrice: formatNumberInput(parsedPrice),
    downPayment: "30",
    interestRate: "8.5",
    loanTerm: "20",
    monthlyIncome: "",
    expectedRent: "",
  });

  const [selectedPreset, setSelectedPreset] = useState("");
  const [results, setResults] = useState<any>(null);

  const suggestedRent = formData.propertyPrice ? 
    Math.round(parseFloat(formData.propertyPrice) * 0.005).toString() : "";

  const financialPresets = [
    {
      id: "conservative",
      name: "Bảo thủ",
      downPayment: "50",
      loanTerm: "15",
      description: "Đóng trước 50%, vay 15 năm",
      gradient: "from-blue-50 to-indigo-50",
      icon: "🛡️"
    },
    {
      id: "balanced",
      name: "Cân bằng",
      downPayment: "30",
      loanTerm: "20",
      description: "Đóng trước 30%, vay 20 năm",
      gradient: "from-emerald-50 to-teal-50",
      icon: "⚖️"
    },
    {
      id: "aggressive",
      name: "Tích cực",
      downPayment: "20",
      loanTerm: "25",
      description: "Đóng trước 20%, vay 25 năm",
      gradient: "from-amber-50 to-orange-50",
      icon: "🚀"
    },
    {
      id: "investment",
      name: "Đầu tư",
      downPayment: "20",
      loanTerm: "30",
      description: "Đóng trước 20%, vay 30 năm",
      gradient: "from-purple-50 to-pink-50",
      icon: "💎"
    }
  ];

  const applyPreset = (preset: typeof financialPresets[0]) => {
    const newFormData = {
      ...formData,
      downPayment: preset.downPayment,
      loanTerm: preset.loanTerm,
      expectedRent: formData.expectedRent || suggestedRent
    };
    setFormData(newFormData);
    setSelectedPreset(preset.id);
    
    if (newFormData.propertyPrice) {
      const price = parseFloat(newFormData.propertyPrice);
      const downPercent = parseFloat(preset.downPayment);
      const rate = parseFloat(newFormData.interestRate) / 100 / 12;
      const term = parseFloat(preset.loanTerm) * 12;
      
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
    }
  };

  const calculateLoan = () => {
    const price = parseFloat(formData.propertyPrice);
    const downPercent = parseFloat(formData.downPayment);
    const rate = parseFloat(formData.interestRate) / 100 / 12;
    const term = parseFloat(formData.loanTerm) * 12;
    
    const loanAmount = price * (1 - downPercent / 100);
    const monthlyPayment = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - loanAmount;
    
    if (!formData.expectedRent && suggestedRent) {
      setFormData(prev => ({ ...prev, expectedRent: suggestedRent }));
    }
    
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

  return (
    <div className="space-y-6">
      {/* Kế hoạch tài chính - Soft Design */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Label className="text-lg font-bold text-slate-900">Kế hoạch tài chính phổ biến</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border-2 ${
                selectedPreset === preset.id
                  ? "border-primary shadow-lg scale-[1.02]"
                  : "border-slate-200 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-60`} />
              <div className="relative">
                <div className="text-3xl mb-2">{preset.icon}</div>
                <div className="font-bold text-base text-slate-900 mb-1">{preset.name}</div>
                <div className="text-sm text-slate-600">{preset.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Giá thuê đề xuất - Soft Card */}
      {suggestedRent && !formData.expectedRent && (
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Giá thuê đề xuất
                </div>
                <div className="text-sm text-slate-600">
                  {formatCurrency(parseFloat(suggestedRent))}/tháng (0.5% giá trị)
                </div>
              </div>
              <Button 
                size="default" 
                className="rounded-xl shadow-md hover:shadow-lg"
                onClick={() => setFormData({ ...formData, expectedRent: suggestedRent })}
              >
                Áp dụng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Form - Rounded Design */}
      <Card className="rounded-2xl shadow-lg border-0 bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="propertyPrice" className="text-sm font-semibold text-slate-700">Giá căn hộ (VNĐ)</Label>
              <Input
                id="propertyPrice"
                type="number"
                placeholder="3000000000"
                value={formData.propertyPrice}
                onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Trả trước (%)</Label>
              <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                <SelectTrigger className="h-12 text-base rounded-xl border-2">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-sm font-semibold text-slate-700">Lãi suất (%/năm)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Thời hạn vay</Label>
              <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                <SelectTrigger className="h-12 text-base rounded-xl border-2">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-slate-700">Thu nhập hàng tháng</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="50000000"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedRent" className="text-sm font-semibold text-slate-700">Giá thuê dự kiến</Label>
              <Input
                id="expectedRent"
                type="number"
                placeholder="20000000"
                value={formData.expectedRent}
                onChange={(e) => setFormData({ ...formData, expectedRent: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary"
              />
            </div>
          </div>

          <Button 
            onClick={calculateLoan} 
            className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
            disabled={!formData.propertyPrice}
          >
            <Calculator className="w-5 h-5 mr-2" />
            Tính toán dòng tiền
          </Button>
        </CardContent>
      </Card>

      {/* Results - Soft Rounded Cards */}
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

              {formData.expectedRent && (
                <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200/50">
                  <div className="flex justify-between text-base mb-2">
                    <span className="text-slate-700 font-medium">Chênh lệch hàng tháng:</span>
                    <span className={`font-bold ${
                      parseFloat(formData.expectedRent) >= results.monthlyPayment
                        ? "text-emerald-600" 
                        : "text-red-600"
                    }`}>
                      {formatCurrency(parseFloat(formData.expectedRent) - results.monthlyPayment)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 font-medium mb-3">
                    {parseFloat(formData.expectedRent) >= results.monthlyPayment 
                      ? "✓ Tiền thuê đủ trang trải" 
                      : "⚠ Cần bù thêm từ thu nhập"}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tiền thuê/tháng:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(parseFloat(formData.expectedRent))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Trả vay/tháng:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(results.monthlyPayment)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentCalculator;