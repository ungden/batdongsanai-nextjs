import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePricingHistory, useComparableSales } from '@/hooks/useMarketData';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PricingInsightsProps {
  projectId: string;
  currentPrice?: number;
}

export const PricingInsights = ({ projectId, currentPrice = 0 }: PricingInsightsProps) => {
  const { pricingHistory, loading: historyLoading } = usePricingHistory(projectId);
  const { comparableSales, avgTransactionPrice, loading: salesLoading } = useComparableSales(projectId);

  // Calculate price trend
  const priceChange = pricingHistory.length >= 2
    ? ((pricingHistory[pricingHistory.length - 1].price_per_sqm - pricingHistory[0].price_per_sqm) / pricingHistory[0].price_per_sqm) * 100
    : 0;

  // Group pricing by type for chart
  const chartData = pricingHistory.map(item => ({
    date: format(new Date(item.price_date), 'MM/yyyy', { locale: vi }),
    price: item.price_per_sqm,
    type: item.price_type
  }));

  // Calculate price statistics
  const maxPrice = Math.max(...pricingHistory.map(h => h.price_per_sqm), 0);
  const minPrice = Math.min(...pricingHistory.map(h => h.price_per_sqm), Infinity);
  const avgPrice = pricingHistory.length > 0
    ? pricingHistory.reduce((sum, h) => sum + h.price_per_sqm, 0) / pricingHistory.length
    : 0;

  return (
    <Card className="hover-lift bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChart3 className="h-5 w-5" />
          Phân tích giá chi tiết
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-muted/30 border border-border/50">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Giá hiện tại</div>
              <div className="text-lg font-bold text-foreground">{formatCurrency(currentPrice)}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border border-border/50">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Biến động</div>
              <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {priceChange >= 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                {' '}{priceChange.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border border-border/50">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Cao nhất</div>
              <div className="text-lg font-bold text-foreground">{formatCurrency(maxPrice)}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border border-border/50">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Thấp nhất</div>
              <div className="text-lg font-bold text-foreground">{formatCurrency(minPrice)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Lịch sử giá</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Giao dịch thực</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4 mt-4">
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : pricingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu lịch sử giá
              </div>
            ) : (
              <>
                {/* Price Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value || 0)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Giá/m²"
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Price History Table */}
                <div className="space-y-2">
                  {pricingHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {format(new Date(item.price_date), 'dd/MM/yyyy', { locale: vi })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.unit_type || 'Tất cả loại'}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-border">
                          {item.price_type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">{formatCurrency(item.price_per_sqm)}</div>
                        {item.source && (
                          <div className="text-xs text-muted-foreground">{item.source}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            {salesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : comparableSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu giao dịch thực tế
              </div>
            ) : (
              <>
                {/* Average Transaction Price */}
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Giá giao dịch trung bình</div>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(avgTransactionPrice)}</div>
                      </div>
                      <Activity className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions List */}
                <div className="space-y-2">
                  {comparableSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-4 bg-muted/20 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">{sale.unit_type || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(sale.transaction_date), 'dd/MM/yyyy', { locale: vi })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{formatCurrency(sale.price_per_sqm)}</div>
                          <div className="text-xs text-muted-foreground">
                            {sale.area_sqm}m²
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {sale.transaction_type && (
                          <Badge variant="outline" className="border-border">{sale.transaction_type}</Badge>
                        )}
                        {sale.condition && (
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{sale.condition}</Badge>
                        )}
                        {sale.view_type && (
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{sale.view_type}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};