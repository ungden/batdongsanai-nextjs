"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  TrendingUp,
  Home,
  Wallet,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Info,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import SEOHead from '@/components/seo/SEOHead';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';

const AdvancedCalculator = () => {
  const { inputs, results } = useInvestmentCalculator();

  return (
    <>
      <SEOHead
        title="Tính toán đầu tư nâng cao"
        description="Công cụ tính toán chi tiết cho đầu tư bất động sản"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <Calculator className="inline-block mr-3 h-8 w-8" />
            Tính toán đầu tư nâng cao
          </h1>
          <p className="text-muted-foreground">
            Phân tích chi tiết cash flow, ROI và dự báo giá trị tài sản
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông tin đầu tư
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Value */}
              <div className="space-y-2">
                <Label>Giá/m² (VNĐ)</Label>
                <Input
                  type="number"
                  value={inputs.pricePerSqm}
                  onChange={(e) => inputs.setPricePerSqm(Number(e.target.value))}
                  step={1000000}
                />
              </div>

              <div className="space-y-2">
                <Label>Diện tích (m²)</Label>
                <Input
                  type="number"
                  value={inputs.area}
                  onChange={(e) => inputs.setArea(Number(e.target.value))}
                />
                <div className="text-sm text-muted-foreground">
                  Tổng giá: <span className="font-bold text-primary">{formatCurrency(results.totalPrice)}</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <Label>Vốn tự có (%)</Label>
                <Slider
                  value={[inputs.downPaymentPercent]}
                  onValueChange={(value) => inputs.setDownPaymentPercent(value[0])}
                  min={10}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-sm">
                  <span>{inputs.downPaymentPercent}%</span>
                  <span className="font-bold">{formatCurrency(results.downPayment)}</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <Label>Thời hạn vay (năm)</Label>
                <Slider
                  value={[inputs.loanTerm]}
                  onValueChange={(value) => inputs.setLoanTerm(value[0])}
                  min={5}
                  max={30}
                  step={1}
                />
                <div className="text-sm">{inputs.loanTerm} năm</div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label>Lãi suất (%/năm)</Label>
                <Input
                  type="number"
                  value={inputs.interestRate}
                  onChange={(e) => inputs.setInterestRate(Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={20}
                />
              </div>

              {/* Rental Yield */}
              <div className="space-y-2">
                <Label>Lợi nhuận cho thuê (%/năm)</Label>
                <Input
                  type="number"
                  value={inputs.rentalYield}
                  onChange={(e) => inputs.setRentalYield(Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={15}
                />
              </div>

              {/* Appreciation Rate */}
              <div className="space-y-2">
                <Label>Tăng giá dự kiến (%/năm)</Label>
                <Input
                  type="number"
                  value={inputs.appreciationRate}
                  onChange={(e) => inputs.setAppreciationRate(Number(e.target.value))}
                  step={0.1}
                  min={-10}
                  max={20}
                />
              </div>

              {/* Maintenance Cost */}
              <div className="space-y-2">
                <Label>Chi phí duy trì (%/năm)</Label>
                <Input
                  type="number"
                  value={inputs.maintenanceCost}
                  onChange={(e) => inputs.setMaintenanceCost(Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className={`${results.isPositiveCashFlow ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cash Flow/tháng</p>
                      <h3 className={`text-2xl font-bold mt-1 ${results.isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(results.monthlyCashFlow)}
                      </h3>
                    </div>
                    {results.isPositiveCashFlow ? (
                      <ArrowUpCircle className="h-10 w-10 text-green-600 opacity-50" />
                    ) : (
                      <ArrowDownCircle className="h-10 w-10 text-red-600 opacity-50" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Cash-on-Cash Return</p>
                      <h3 className="text-2xl font-bold mt-1 text-blue-600">
                        {results.cashOnCashReturn.toFixed(2)}%
                      </h3>
                    </div>
                    <TrendingUp className="h-10 w-10 text-blue-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Thanh toán/tháng</p>
                      <h3 className="text-2xl font-bold mt-1 text-purple-600">
                        {formatCurrency(results.monthlyPayment)}
                      </h3>
                    </div>
                    <Wallet className="h-10 w-10 text-purple-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Tabs defaultValue="loan" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="loan">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Khoản vay
                </TabsTrigger>
                <TabsTrigger value="rental">
                  <Home className="h-4 w-4 mr-2" />
                  Cho thuê
                </TabsTrigger>
                <TabsTrigger value="appreciation">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tăng giá
                </TabsTrigger>
                <TabsTrigger value="projection">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dự báo
                </TabsTrigger>
              </TabsList>

              {/* Loan Tab */}
              <TabsContent value="loan" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin khoản vay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Số tiền vay</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.loanAmount)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Thanh toán hàng tháng</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(results.monthlyPayment)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Tổng lãi suất</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(results.totalInterest)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.totalPayment)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Info className="h-4 w-4" />
                        Phân tích khoản vay
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li>• Vốn tự có: {formatCurrency(results.downPayment)} ({inputs.downPaymentPercent}%)</li>
                        <li>• Vay ngân hàng: {formatCurrency(results.loanAmount)} ({100 - inputs.downPaymentPercent}%)</li>
                        <li>• Lãi suất: {inputs.interestRate}%/năm</li>
                        <li>• Thời hạn: {inputs.loanTerm} năm ({results.numberOfPayments} tháng)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rental Tab */}
              <TabsContent value="rental" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Phân tích thu nhập cho thuê</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Thu nhập thuê/tháng</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(results.monthlyRentalIncome)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Chi phí duy trì/tháng</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(results.monthlyMaintenanceCost)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Thu nhập ròng/tháng</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.netMonthlyRentalIncome)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Cash Flow/tháng</p>
                        <p className={`text-2xl font-bold ${results.isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.monthlyCashFlow)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Rental Yield</span>
                          <span className="font-bold">{inputs.rentalYield}%/năm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash-on-Cash Return</span>
                          <span className="font-bold">{results.cashOnCashReturn.toFixed(2)}%/năm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian hoàn vốn (ước tính)</span>
                          <span className="font-bold">
                            {results.isPositiveCashFlow && results.cashOnCashReturn > 0
                              ? `${(100 / results.cashOnCashReturn).toFixed(1)} năm`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appreciation Tab */}
              <TabsContent value="appreciation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dự báo giá trị tài sản</CardTitle>
                    <CardDescription>Tăng giá {inputs.appreciationRate}%/năm</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Sau 5 năm</p>
                        <p className="text-xl font-bold">{formatCurrency(results.futureValue5Years)}</p>
                        <p className="text-sm text-green-600 mt-1">
                          +{formatCurrency(results.futureValue5Years - results.totalPrice)}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Sau 10 năm</p>
                        <p className="text-xl font-bold">{formatCurrency(results.futureValue10Years)}</p>
                        <p className="text-sm text-green-600 mt-1">
                          +{formatCurrency(results.futureValue10Years - results.totalPrice)}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Sau 20 năm</p>
                        <p className="text-xl font-bold">{formatCurrency(results.futureValue20Years)}</p>
                        <p className="text-sm text-green-600 mt-1">
                          +{formatCurrency(results.futureValue20Years - results.totalPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={results.cashFlowProjection}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" label={{ value: 'Năm', position: 'insideBottom', offset: -5 }} />
                          <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(0)}B`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Area
                            type="monotone"
                            dataKey="propertyValue"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            name="Giá trị tài sản"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projection Tab */}
              <TabsContent value="projection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dự báo 10 năm</CardTitle>
                    <CardDescription>Cash flow và equity tích lũy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={results.cashFlowProjection}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(0)}B`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="equity" fill="#10b981" name="Vốn chủ sở hữu" />
                        <Bar dataKey="cumulativeCashFlow" fill="#3b82f6" name="Cash Flow tích lũy" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Projection Table */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Năm</th>
                            <th className="text-right p-2">Giá trị BĐS</th>
                            <th className="text-right p-2">Nợ còn lại</th>
                            <th className="text-right p-2">Equity</th>
                            <th className="text-right p-2">Cash Flow tích lũy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.cashFlowProjection.map((item) => (
                            <tr key={item.year} className="border-b">
                              <td className="p-2">{item.year}</td>
                              <td className="text-right p-2">{formatCurrency(item.propertyValue)}</td>
                              <td className="text-right p-2 text-red-600">{formatCurrency(item.remainingBalance)}</td>
                              <td className="text-right p-2 text-green-600 font-bold">{formatCurrency(item.equity)}</td>
                              <td className={`text-right p-2 font-bold ${item.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(item.cumulativeCashFlow)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedCalculator;