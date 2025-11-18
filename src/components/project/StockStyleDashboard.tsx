import { useState, useEffect } from 'react';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

  const priceChangeFromIPO = currentPrice - ipoPrice;
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

  return (
    <div className="space-y-6">
      {/* Stock Ticker Header */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{projectName}</h2>
                <Badge variant="outline" className="text-sm font-mono">
                  {projectId.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Ticker Symbol • Real Estate Project</p>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </div>

          {/* Current Price */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Current Price</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-bold">{formatCurrency(currentPrice)}</h3>
                <div className={`flex items-center gap-1 ${isNeutral30d ? 'text-muted-foreground' : isPositive30d ? 'text-green-600' : 'text-red-600'}`}>
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
              <p className="text-sm text-muted-foreground mb-1">IPO Price</p>
              <p className="text-2xl font-bold">{formatCurrency(ipoPrice)}</p>
              <p className={`text-sm mt-1 ${priceChangePercentFromIPO >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChangePercentFromIPO >= 0 ? '+' : ''}{priceChangePercentFromIPO.toFixed(2)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">52W Range</p>
              <p className="text-xl font-bold">{(allTimeLow / 1000000).toFixed(0)}M - {(allTimeHigh / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-muted-foreground mt-1">VND/m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Price Chart
              </CardTitle>
              <CardDescription>Lịch sử giá giao dịch</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">1M</Button>
              <Button variant="outline" size="sm">3M</Button>
              <Button variant="outline" size="sm">6M</Button>
              <Button variant="default" size="sm">ALL</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Triệu VND/m²', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value * 1000000), 'Giá']}
                labelFormatter={(label) => `Tháng: ${label}`}
              />
              <ReferenceLine
                y={ipoPrice / 1000000}
                stroke="#666"
                strokeDasharray="3 3"
                label={{ value: 'IPO', position: 'right', fill: '#666' }}
              />
              <Area
                type="monotone"
                dataKey="priceInBillion"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Key Statistics */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Open (IPO)</p>
              <p className="text-lg font-bold">{(ipoPrice / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">High</p>
              <p className="text-lg font-bold text-green-600">{(allTimeHigh / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Low</p>
              <p className="text-lg font-bold text-red-600">{(allTimeLow / 1000000).toFixed(0)}M</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-lg font-bold">{(currentPrice / 1000000).toFixed(0)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalysts Section */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            <Zap className="h-4 w-4 mr-2" />
            Upcoming Catalysts ({upcomingCatalysts.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            <Calendar className="h-4 w-4 mr-2" />
            Past Events ({pastCatalysts.length})
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Catalysts */}
        <TabsContent value="upcoming" className="space-y-4">
          {expectedPriceImpact > 0 && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-bold text-lg">Expected Price Impact: +{expectedPriceImpact.toFixed(1)}%</h4>
                  <p className="text-sm text-muted-foreground">
                    Từ {upcomingCatalysts.length} catalysts sắp tới
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingCatalysts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có catalyst nào được công bố</p>
              </CardContent>
            </Card>
          ) : (
            upcomingCatalysts.map((catalyst) => (
              <Card key={catalyst.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={catalyst.impact_direction === 'positive' ? 'default' : 'destructive'}>
                          {catalyst.impact_direction === 'positive' ? '↑' : '↓'} {catalyst.impact_level}
                        </Badge>
                        <Badge variant="outline">{catalyst.catalyst_type}</Badge>
                      </div>
                      <h4 className="font-bold text-lg mb-2">{catalyst.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{catalyst.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${catalyst.impact_direction === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {catalyst.impact_direction === 'positive' ? '+' : ''}{catalyst.estimated_price_impact_percent || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Expected</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        <TabsContent value="past" className="space-y-4">
          {pastCatalysts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có catalyst nào đã xảy ra</p>
              </CardContent>
            </Card>
          ) : (
            pastCatalysts.map((catalyst) => (
              <Card key={catalyst.id} className="opacity-80">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={catalyst.impact_direction === 'positive' ? 'default' : 'destructive'}>
                          {catalyst.impact_direction === 'positive' ? '↑' : '↓'} {catalyst.impact_level}
                        </Badge>
                        <Badge variant="outline">{catalyst.catalyst_type}</Badge>
                        <Badge variant="secondary">Realized</Badge>
                      </div>
                      <h4 className="font-bold text-lg mb-2">{catalyst.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{catalyst.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${catalyst.impact_direction === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {catalyst.impact_direction === 'positive' ? '+' : ''}{catalyst.estimated_price_impact_percent || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Impact</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(catalyst.effective_date || catalyst.announcement_date), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                    {catalyst.verification_status === 'verified' && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Verified
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Bullish Signals</p>
              <p className="text-3xl font-bold text-green-600">{upcomingCatalysts.filter(c => c.impact_direction === 'positive').length}</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Bearish Signals</p>
              <p className="text-3xl font-bold text-red-600">{upcomingCatalysts.filter(c => c.impact_direction === 'negative').length}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Analyst Rating</p>
              <p className="text-3xl font-bold text-blue-600">
                {expectedPriceImpact > 5 ? 'BUY' : expectedPriceImpact > 0 ? 'HOLD' : 'WAIT'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
