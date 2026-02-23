import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, Calculator, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { ShareResultButton } from "@/components/calculator/ShareResultButton";
import { useRef } from "react";

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
  const resultsRef = useRef<HTMLDivElement>(null);
  
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
      gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
      icon: "🛡️"
    },
    {
      id: "balanced",
      name: "Cân bằng",
      downPayment: "30",
      loanTerm: "20",
      description: "Đóng trước 30%, vay 20 năm",
      gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
      icon: "⚖️"
    },
    {
      id: "aggressive",
      name: "Tích cực",
      downPayment: "20",
      loanTerm: "25",
      description: "Đóng trước 20%, vay 25 năm",
      gradient: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
      icon: "🚀"
    },
    {
      id: "investment",
      name: "Đầu tư",
      downPayment: "20",
      loanTerm: "30",
      description: "Đóng trước 20%, vay 30 năm",
      gradient: "from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40",
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

  return (
    <div className="space-y-6">
      {/* Kế hoạch tài chính - Soft Design */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Label className="text-lg font-bold text-foreground">Kế hoạch tài chính phổ biến</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border-2 ${
                selectedPreset === preset.id
                  ? "border-primary shadow-lg scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-60`} />
              <div className="relative">
                <div className="text-3xl mb-2">{preset.icon}</div>
                <div className="font-bold text-base text-foreground mb-1">{preset.name}</div>
                <div className="text-sm text-muted-foreground">{preset.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Giá thuê đề xuất - Soft Card */}
      {suggestedRent && !formData.expectedRent && (
        <Card className="rounded-2xl shadow-md border-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Giá thuê đề xuất
                </div>
                <div className="text-sm text-muted-foreground">
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
      <Card className="rounded-2xl shadow-lg border-0 bg-card">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="propertyPrice" className="text-sm font-semibold text-foreground">Giá căn hộ (VNĐ)</Label>
              <Input
                id="propertyPrice"
                type="number"
                placeholder="3000000000"
                value={formData.propertyPrice}
                onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Trả trước (%)</Label>
              <Select value={formData.downPayment} onValueChange={(value) => setFormData({ ...formData, downPayment: value })}>
                <SelectTrigger className="h-12 text-base rounded-xl border-2 bg-background">
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
              <Label htmlFor="interestRate" className="text-sm font-semibold text-foreground">Lãi suất (%/năm)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Thời hạn vay</Label>
              <Select value={formData.loanTerm} onValueChange={(value) => setFormData({ ...formData, loanTerm: value })}>
                <SelectTrigger className="h-12 text-base rounded-xl border-2 bg-background">
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
              <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-foreground">Thu nhập hàng tháng</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="50000000"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedRent" className="text-sm font-semibold text-foreground">Giá thuê dự kiến</Label>
              <Input
                id="expectedRent"
                type="number"
                placeholder="20000000"
                value={formData.expectedRent}
                onChange={(e) => setFormData({ ...formData, expectedRent: e.target.value })}
                className="h-12 text-base rounded-xl border-2 focus:border-primary bg-background"
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
        <div className="space-y-5" ref={resultsRef}>
          {/* Wrapper div for capture to include everything relevant */}
          <div className="p-1"> 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2 font-medium">Trả hàng tháng</div>
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {formatCurrency(results.monthlyPayment)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2 font-medium">Trả trước</div>
                      <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(results.downPaymentAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl shadow-lg border-0 bg-card">
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
                    <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-xl">
                      <div className="flex justify-between text-base mb-2">
                        <span className="text-foreground font-medium">Tỷ lệ trả nợ/thu nhập:</span>
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

                  {formData.expectedRent && (
                     <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200/50 dark:border-emerald-900/50">
                        {/* Existing rent calculation logic */}
                        <div className="flex justify-between text-base mb-2">
                            <span className="text-foreground font-medium">Chênh lệch hàng tháng:</span>
                            <span className={`font-bold ${
                            parseFloat(formData.expectedRent) >= results.monthlyPayment
                                ? "text-emerald-600 dark:text-emerald-400" 
                                : "text-red-600 dark:text-red-400"
                            }`}>
                            {formatCurrency(parseFloat(formData.expectedRent) - results.monthlyPayment)}
                            </span>
                        </div>
                        <div className="text-sm text-foreground font-medium mb-3">
                            {parseFloat(formData.expectedRent) >= results.monthlyPayment 
                            ? "✓ Tiền thuê đủ trang trải" 
                            : "⚠ Cần bù thêm từ thu nhập"}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tiền thuê/tháng:</span>
                            <span className="font-semibold text-foreground">{formatCurrency(parseFloat(formData.expectedRent))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Trả vay/tháng:</span>
                            <span className="font-semibold text-foreground">{formatCurrency(results.monthlyPayment)}</span>
                            </div>
                        </div>
                     </div>
                  )}
                </CardContent>
              </Card>
          </div>
          
          {/* Share Button outside the capture ref */}
          <div className="flex justify-end">
             <ShareResultButton targetRef={resultsRef as any} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCalculator;