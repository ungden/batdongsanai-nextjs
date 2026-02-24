"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, MessageSquare, Heart, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeAnalyticsProps {
  className?: string;
}

interface DailyStats {
  date: string;
  consultations: number;
  favorites: number;
  activity: number;
}

interface ProjectStats {
  project_id: string;
  project_name: string;
  views: number;
}

const RealTimeAnalytics = ({ className }: RealTimeAnalyticsProps) => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get daily stats for the selected time range
      const daysBack = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch consultation requests
      const { data: consultations } = await supabase
        .from('consultation_requests')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Fetch favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Fetch admin logs for activity
      const { data: adminLogs } = await supabase
        .from('admin_logs')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Process daily stats
      const dailyData: Record<string, DailyStats> = {};
      
      // Initialize all days
      for (let i = 0; i < daysBack; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          date: dateStr,
          consultations: 0,
          favorites: 0,
          activity: 0
        };
      }

      // Count consultations
      consultations?.forEach(item => {
        const date = item.created_at.split('T')[0];
        if (dailyData[date]) {
          dailyData[date].consultations++;
        }
      });

      // Count favorites
      favorites?.forEach(item => {
        const date = item.created_at.split('T')[0];
        if (dailyData[date]) {
          dailyData[date].favorites++;
        }
      });

      // Count admin activity
      adminLogs?.forEach(item => {
        const date = item.created_at.split('T')[0];
        if (dailyData[date]) {
          dailyData[date].activity++;
        }
      });

      const sortedDailyStats = Object.values(dailyData)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('vi-VN', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));

      setDailyStats(sortedDailyStats);

      // Get top projects by favorites
      const { data: topProjects } = await supabase
        .from('favorites')
        .select('project_id, project_name')
        .gte('created_at', startDate.toISOString());

      // Count favorites per project
      const projectCounts: Record<string, { name: string; count: number }> = {};
      topProjects?.forEach(item => {
        if (!projectCounts[item.project_id]) {
          projectCounts[item.project_id] = { name: item.project_name, count: 0 };
        }
        projectCounts[item.project_id].count++;
      });

      const sortedProjectStats = Object.entries(projectCounts)
        .map(([id, data]) => ({
          project_id: id,
          project_name: data.name,
          views: data.count
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setProjectStats(sortedProjectStats);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  const totalStats = dailyStats.reduce((acc, curr) => ({
    consultations: acc.consultations + curr.consultations,
    favorites: acc.favorites + curr.favorites,
    activity: acc.activity + curr.activity
  }), { consultations: 0, favorites: 0, activity: 0 });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with time range selector */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold">Phân tích thời gian thực</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-blue-600 font-medium">Tư vấn</div>
                <div className="text-2xl font-bold text-blue-700">{totalStats.consultations}</div>
                <div className="text-xs text-blue-500">Tổng {selectedTimeRange === '7d' ? '7 ngày' : selectedTimeRange === '30d' ? '30 ngày' : '90 ngày'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <Heart className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-sm text-green-600 font-medium">Yêu thích</div>
                <div className="text-2xl font-bold text-green-700">{totalStats.favorites}</div>
                <div className="text-xs text-green-500">Tổng {selectedTimeRange === '7d' ? '7 ngày' : selectedTimeRange === '30d' ? '30 ngày' : '90 ngày'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm text-purple-600 font-medium">Hoạt động</div>
                <div className="text-2xl font-bold text-purple-700">{totalStats.activity}</div>
                <div className="text-xs text-purple-500">Admin actions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hoạt động theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultations" fill="#8884d8" name="Tư vấn" />
                <Bar dataKey="favorites" fill="#82ca9d" name="Yêu thích" />
                <Bar dataKey="activity" fill="#ffc658" name="Hoạt động" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dự án được yêu thích nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectStats.length > 0 ? (
                projectStats.map((project, index) => (
                  <div key={project.project_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">{project.project_name}</div>
                        <div className="text-xs text-muted-foreground">ID: {project.project_id.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">{project.views}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;