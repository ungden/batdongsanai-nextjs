"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Building, 
  MessageSquare,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// Chart functionality can be added later with recharts

interface WebsiteAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  totalViews: number;
  totalConsultations: number;
  totalFavorites: number;
  dailyViews: Array<{ date: string; views: number }>;
  popularProjects: Array<{ project_id: string; views: number }>;
  recentActivity: Array<{ type: string; count: number; date: string }>;
}

const WebsiteAnalytics = ({ className }: WebsiteAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalConsultations: 0,
    totalFavorites: 0,
    dailyViews: [],
    popularProjects: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch project views
      const { data: viewsData } = await supabase
        .from('project_views')
        .select('*');

      // Fetch consultation requests
      const { data: consultationsData } = await supabase
        .from('consultation_requests')
        .select('*');

      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*');

      // Process data
      const totalViews = viewsData?.length || 0;
      const totalConsultations = consultationsData?.length || 0;
      const totalFavorites = favoritesData?.length || 0;

      // Group views by date (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyViews = last7Days.map(date => {
        const views = viewsData?.filter(view => 
          view.created_at.startsWith(date)
        ).length || 0;
        return { date, views };
      });

      // Popular projects (top 5)
      const projectViewCounts = viewsData?.reduce((acc: Record<string, number>, view) => {
        acc[view.project_id] = (acc[view.project_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const popularProjects = Object.entries(projectViewCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([project_id, views]) => ({ project_id, views }));

      setAnalytics({
        totalViews,
        totalConsultations,
        totalFavorites,
        dailyViews,
        popularProjects,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Thống kê Website
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Tổng lượt xem</p>
                  <p className="text-2xl font-bold text-primary">{analytics.totalViews}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/5 rounded-lg p-4">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Yêu cầu tư vấn</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.totalConsultations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-500/5 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Dự án yêu thích</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.totalFavorites}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Views Chart */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Lượt xem 7 ngày qua
            </h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="space-y-2">
                {analytics.dailyViews.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{formatDate(day.date)}</span>
                    <div className="flex items-center">
                      <div 
                        className="bg-primary h-2 rounded mr-2"
                        style={{ 
                          width: `${Math.max((day.views / Math.max(...analytics.dailyViews.map(d => d.views), 1)) * 100, 5)}px`,
                          minWidth: '20px'
                        }}
                      />
                      <span className="text-sm font-bold w-8 text-right">{day.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Projects */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Dự án phổ biến
            </h4>
            <div className="space-y-2">
              {analytics.popularProjects.length > 0 ? (
                analytics.popularProjects.map((project, index) => (
                  <div key={project.project_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="mr-3">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">
                        Dự án {project.project_id.substring(0, 8)}...
                      </span>
                    </div>
                    <span className="font-bold text-primary">{project.views} lượt xem</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteAnalytics;