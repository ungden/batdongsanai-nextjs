"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Database,
  Activity,
  DollarSign,
  Home,
  Zap,
  Building2
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface DataStats {
  catalysts: number;
  pricing: number;
  rental: number;
  policies: number;
  infrastructure: number;
  sales: number;
  regulations: number;
}

interface PriceTrend {
  date: string;
  avgPrice: number;
  count: number;
}

interface CatalystImpact {
  type: string;
  count: number;
  avgImpact: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<DataStats>({
    catalysts: 0,
    pricing: 0,
    rental: 0,
    policies: 0,
    infrastructure: 0,
    sales: 0,
    regulations: 0,
  });

  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [catalystData, setCatalystData] = useState<CatalystImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all data counts
      const [
        { count: catalystsCount },
        { count: pricingCount },
        { count: rentalCount },
        { count: policiesCount },
        { count: infraCount },
        { count: salesCount },
        { count: regulationsCount },
      ] = await Promise.all([
        supabase.from('market_catalysts' as any).select('*', { count: 'exact', head: true }),
        supabase.from('project_pricing_history' as any).select('*', { count: 'exact', head: true }),
        supabase.from('rental_market_data' as any).select('*', { count: 'exact', head: true }),
        supabase.from('payment_policies' as any).select('*', { count: 'exact', head: true }),
        supabase.from('infrastructure_developments' as any).select('*', { count: 'exact', head: true }),
        supabase.from('comparable_sales' as any).select('*', { count: 'exact', head: true }),
        supabase.from('market_regulations' as any).select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        catalysts: catalystsCount || 0,
        pricing: pricingCount || 0,
        rental: rentalCount || 0,
        policies: policiesCount || 0,
        infrastructure: infraCount || 0,
        sales: salesCount || 0,
        regulations: regulationsCount || 0,
      });

      // Fetch price trends
      const { data: pricingData } = await supabase
        .from('project_pricing_history' as any)
        .select('price_date, price_per_sqm')
        .order('price_date', { ascending: true })
        .limit(50);

      if (pricingData) {
        const trends = pricingData.reduce((acc: any, item: any) => {
          const month = item.price_date.substring(0, 7); // YYYY-MM
          if (!acc[month]) {
            acc[month] = { date: month, total: 0, count: 0 };
          }
          acc[month].total += item.price_per_sqm;
          acc[month].count += 1;
          return acc;
        }, {});

        const trendData = Object.values(trends).map((t: any) => ({
          date: t.date,
          avgPrice: Math.round(t.total / t.count),
          count: t.count,
        }));

        setPriceTrends(trendData);
      }

      // Fetch catalyst impact by type
      const { data: catalystsData } = await supabase
        .from('market_catalysts' as any)
        .select('catalyst_type, impact_level, estimated_price_impact_percent');

      if (catalystsData) {
        const byType = catalystsData.reduce((acc: any, item: any) => {
          if (!acc[item.catalyst_type]) {
            acc[item.catalyst_type] = { type: item.catalyst_type, count: 0, totalImpact: 0 };
          }
          acc[item.catalyst_type].count += 1;
          acc[item.catalyst_type].totalImpact += item.estimated_price_impact_percent || 0;
          return acc;
        }, {});

        const impactData = Object.values(byType).map((t: any) => ({
          type: t.type,
          count: t.count,
          avgImpact: t.count > 0 ? parseFloat((t.totalImpact / t.count).toFixed(2)) : 0,
        }));

        setCatalystData(impactData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const dataDistribution = [
    { name: 'Catalysts', value: stats.catalysts },
    { name: 'Pricing', value: stats.pricing },
    { name: 'Rental', value: stats.rental },
    { name: 'Policies', value: stats.policies },
    { name: 'Infrastructure', value: stats.infrastructure },
    { name: 'Sales', value: stats.sales },
    { name: 'Regulations', value: stats.regulations },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Phân tích dữ liệu thị trường & hiệu suất hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng bản ghi</p>
                <h3 className="text-3xl font-bold mt-1">{totalRecords.toLocaleString()}</h3>
              </div>
              <Database className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Catalysts</p>
                <h3 className="text-3xl font-bold mt-1">{stats.catalysts}</h3>
              </div>
              <Zap className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pricing Data</p>
                <h3 className="text-3xl font-bold mt-1">{stats.pricing}</h3>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Infrastructure</p>
                <h3 className="text-3xl font-bold mt-1">{stats.infrastructure}</h3>
              </div>
              <Building2 className="h-10 w-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pricing Trends
          </TabsTrigger>
          <TabsTrigger value="catalysts">
            <Zap className="h-4 w-4 mr-2" />
            Catalyst Impact
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố dữ liệu</CardTitle>
                <CardDescription>Số lượng bản ghi theo loại dữ liệu</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dataDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Categories Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Số lượng theo danh mục</CardTitle>
                <CardDescription>Tổng số bản ghi mỗi loại</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết dữ liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Market Catalysts</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.catalysts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Pricing History</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.pricing}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Rental Data</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.rental}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Infrastructure</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.infrastructure}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-pink-500" />
                    <span className="font-medium">Comparable Sales</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.sales}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Trends Tab */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng giá theo thời gian</CardTitle>
              <CardDescription>Giá trung bình/m² qua các tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceTrends}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Giá TB']}
                    labelFormatter={(label) => `Tháng: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avgPrice"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Giá TB/m²"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Số lượng dữ liệu giá</CardTitle>
                <CardDescription>Theo từng tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Số bản ghi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceTrends.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Giá cao nhất</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(Math.max(...priceTrends.map((t) => t.avgPrice)))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Giá thấp nhất</span>
                        <span className="text-xl font-bold text-red-600">
                          {formatCurrency(Math.min(...priceTrends.map((t) => t.avgPrice)))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Giá trung bình</span>
                        <span className="text-xl font-bold">
                          {formatCurrency(
                            Math.round(
                              priceTrends.reduce((sum, t) => sum + t.avgPrice, 0) / priceTrends.length
                            )
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Catalyst Impact Tab */}
        <TabsContent value="catalysts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tác động Catalyst theo loại</CardTitle>
              <CardDescription>Tác động giá trung bình (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={catalystData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Số lượng" />
                  <Bar dataKey="avgImpact" fill="#10b981" name="Tác động TB (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {catalystData.map((item, index) => (
              <Card key={item.type}>
                <CardContent className="p-6">
                  <h4 className="font-semibold capitalize mb-2">{item.type.replace('_', ' ')}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số lượng:</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tác động TB:</span>
                      <span className="font-bold text-green-600">+{item.avgImpact}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;