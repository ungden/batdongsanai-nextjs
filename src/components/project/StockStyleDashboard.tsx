import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Calendar,
  BarChart3,
  Bell,
  Info,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';

interface StockStyleDashboardProps {
  projectId: string;
  projectName: string;
  currentPrice: number;
  priceHistory?: any[];
  catalysts?: any[];
}

export const StockStyleDashboard = ({
  projectId,
  projectName,
  currentPrice,
  priceHistory = [],
  catalysts = []
}: StockStyleDashboardProps) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // Calculate price metrics
  const sortedHistory = [...priceHistory].sort((a, b) =>
    new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
  );

  const ipoPrice = sortedHistory[0]?.price_per_sqm || currentPrice;
  const allTimeHigh = Math.max(...sortedHistory.map(p => p.price_per_sqm), currentPrice);
  const allTimeLow = Math.min(...sortedHistory.map(p => p.price_per_sqm), currentPrice);

  const last30Days = sortedHistory.slice(-30);
  const priceChange30d = last30Days.length >= 2
    ? currentPrice - last30Days[0].price_per_sqm
    : 0;
  const priceChangePercent30d = last30Days.length >= 2
    ? ((currentPrice - last30Days[0].price_per_sqm) / last30Days[0].price_per_sqm) * 100
    : 0;

  const priceChangePercentFromIPO = ((currentPrice - ipoPrice) / ipoPrice) * 100;

  const isPositive30d = priceChange30d > 0;
  const isNeutral30d = priceChange30d === 0;

  // Upcoming vs past catalysts
  const upcomingCatalysts = catalysts.filter(c =>
    new Date(c.effective_date || c.announcement_date) > new Date()
  ).sort((a, b) =>
    new Date(a.effective_date || a.announcement_date).getTime() -
    new Date(b.effective_date || b.announcement_date).getTime()
  );

  const pastCatalysts = catalysts.filter(c =>
    new Date(c.effective_date || c.announcement_date) <= new Date()
  ).sort((a, b) =>
    new Date(b.effective_date || b.announcement_date).getTime() -
    new Date(a.effective_date || a.announcement_date).getTime()
  );

  // Expected price impact from upcoming catalysts
  const expectedPriceImpact = upcomingCatalysts.reduce((sum, c) =>
    sum + (c.estimated_price_impact_percent || 0), 0
  );

  // Chart data
  const chartData = sortedHistory.map(item => ({
    date: format(new Date(item.price_date), 'MM/yyyy', { locale: vi }),
    price: item.price_per_sqm,
    priceInBillion: item.price_per_sqm / 1000000,
  }));

  // Colors for charts based on theme
  const chartColor = 'hsl(var(--primary))';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = 'hsl(var(--card))';
  const tooltipBorder = 'hsl(var(--border))';
  const tooltipText = 'hsl(var(--foreground))';

  return (
    <div className="space-y-6">
      {/* Stock Ticker Header */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-foreground">{projectName}</h2>
                <Badge variant="outline" className="text-sm font-mono border-primary/30 text-primary">
                  {projectId.toUpperCase().slice(0, 6)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Ticker Symbol • Real Estate Project</p>
            </div>
            <Button variant="outline" size="sm" className="border-border hover:bg-accent">
              <Bell className="h-4 w-4 mr-2" />
              Nhận tin
            </Button>
          </div>

          {/* Current Price */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Giá hiện tại</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-bold text-foreground">{formatCurrency(currentPrice)}</h3>
                <div className={`flex items-center gap-1 ${isNeutral30d ? 'text-muted-foreground' : isPositive30d ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isNeutral30d ? (
                    <Minus className="h-5 w-5" />
                  ) : isPositive30d ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <ArrowDown className="h-5 w-5" />
                  )}
                  <span className="text-xl font-bold">
                    {priceChangePercent30d >= 0 ? '+' : ''}{priceChangePercent30d.toFixed(2)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isPositive30d ? '+' : ''}{formatCurrency(priceChange30d)} (30 ngày)
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Giá mở bán</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(ipoPrice)}</p>
              <p className={`text-sm mt-1 ${priceChangePercentFromIPO >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChangePercentFromIPO >= 0 ? '+' : ''}{priceChangePercentFromIPO.toFixed(2)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Biên độ 52 tuần</p>
              <p className="text-xl font-bold text-foreground">{(allTimeLow / 1000000).toFixed(0)}M - {(allTimeHigh / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-muted-foreground mt-1">VNĐ/m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Biểu đồ giá
              </CardTitle>
              <CardDescription>Lịch sử giá giao dịch</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">1M</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">3M</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">6M</Button>
              <Button variant="default" size="sm" className="h-8 text-xs">ALL</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: textColor }}
                stroke={gridColor}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                label={{ value: 'Triệu VNĐ/m²', angle: -90, position: 'insideLeft', fill: textColor, style: { textAnchor: 'middle' } }}
                stroke={gridColor}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}M`}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  borderColor: tooltipBorder, 
                  color: tooltipText,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                formatter={(value: any) => [formatCurrency((value || 0) * 1000000), 'Giá']}
                labelFormatter={(label) => `Tháng: ${label}`}
              />
              <ReferenceLine
                y={ipoPrice / 1000000}
                stroke={textColor}
                strokeDasharray="3 3"
                label={{ value: 'IPO', position: 'right', fill: textColor, fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="priceInBillion"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Key Statistics */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Open (IPO)</p>
              <p className="text-lg font-bold text-foreground">{(ipoPrice / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">High</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{(allTimeHigh / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Low</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{(allTimeLow / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Current</p>
              <p className="text-lg font-bold text-foreground">{(currentPrice / 1000000).toFixed(0)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalysts Section */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4 mr-2" />
            Sắp diễn ra ({upcomingCatalysts.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Đã qua ({pastCatalysts.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Catalysts */}
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {expectedPriceImpact > 0 && (
            <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-bold text-lg text-foreground">Dự báo tác động giá: +{expectedPriceImpact.toFixed(1)}%</h4>
                  <p className="text-sm text-muted-foreground">
                    Từ {upcomingCatalysts.length} sự kiện sắp tới
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingCatalysts.length === 0 ? (
            <Card className="bg-muted/20 border-dashed border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có sự kiện tác động nào được công bố</p>
              </CardContent>
            </Card>
          ) : (
            upcomingCatalysts.map((catalyst) => (
              <Card key={catalyst.id} className="hover:shadow-md transition-shadow border-border/60 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={catalyst.impact_direction === 'positive' ? 'default' : 'destructive'} className={catalyst.impact_direction === 'positive' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                          {catalyst.impact_direction === 'positive' ? '↑' : '↓'} {catalyst.impact_level}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">{catalyst.catalyst_type}</Badge>
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-foreground">{catalyst.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{catalyst.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${catalyst.impact_direction === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {catalyst.impact_direction === 'positive' ? '+' : ''}{catalyst.estimated_price_impact_percent || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Dự kiến</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(catalyst.effective_date || catalyst.announcement_date), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                    {catalyst.affected_areas && catalyst.affected_areas.length > 0 && (
                      <div>
                        Ảnh hưởng: {catalyst.affected_areas.join(', ')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Past Catalysts */}
        <TabsContent value="past" className="space-y-4 mt-4">
          {pastCatalysts.length === 0 ? (
            <Card className="bg-muted/20 border-dashed border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có sự kiện nào đã xảy ra</p>
              </CardContent>
            </Card>
          ) : (
            pastCatalysts.map((catalyst) => (
              <Card key={catalyst.id} className="opacity-80 bg-muted/10 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-border text-muted-foreground">{catalyst.catalyst_type}</Badge>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">Đã thực hiện</Badge>
                      </div>
                      <h4 className="font-bold text-lg mb-2 text-foreground">{catalyst.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{catalyst.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${catalyst.impact_direction === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {catalyst.impact_direction === 'positive' ? '+' : ''}{catalyst.estimated_price_impact_percent || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Tác động</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(catalyst.effective_date || catalyst.announcement_date), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                    {catalyst.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600 dark:text-emerald-400">
                        ✓ Đã xác thực
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Market Sentiment */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Tâm lý thị trường
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-sm text-muted-foreground mb-1">Tín hiệu tích cực</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{upcomingCatalysts.filter(c => c.impact_direction === 'positive').length}</p>
            </div>
            <div className="text-center p-4 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/50">
              <p className="text-sm text-muted-foreground mb-1">Tín hiệu tiêu cực</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{upcomingCatalysts.filter(c => c.impact_direction === 'negative').length}</p>
            </div>
            <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-muted-foreground mb-1">Khuyến nghị</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {expectedPriceImpact > 5 ? 'MUA' : expectedPriceImpact > 0 ? 'GIỮ' : 'CHỜ'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};