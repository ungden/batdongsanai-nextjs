import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, TrendingUp, Users, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemHealth {
  total_users: number;
  active_consultations: number;
  total_favorites: number;
  admin_actions_today: number;
  last_activity: string | null;
}

interface SystemHealthMonitorProps {
  className?: string;
}

const SystemHealthMonitor = ({ className }: SystemHealthMonitorProps) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      // Use individual queries since the function doesn't exist yet
      const [users, consultations, favorites, adminLogs] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('consultation_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('admin_logs').select('created_at').order('created_at', { ascending: false }).limit(1)
      ]);

      setHealth({
        total_users: users.count || 0,
        active_consultations: consultations.count || 0,
        total_favorites: favorites.count || 0,
        admin_actions_today: 0,
        last_activity: adminLogs.data?.[0]?.created_at || null
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin hệ thống",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!health) return { status: 'unknown', color: 'gray' };
    
    if (health.active_consultations > 10) return { status: 'busy', color: 'yellow' };
    if (health.admin_actions_today > 50) return { status: 'active', color: 'green' };
    return { status: 'healthy', color: 'green' };
  };

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return 'Chưa có hoạt động';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const healthStatus = getHealthStatus();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Giám sát hệ thống</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={healthStatus.color === 'green' ? 'default' : 'secondary'}>
            <CheckCircle className="w-3 h-3 mr-1" />
            {healthStatus.status === 'healthy' ? 'Tốt' : 
             healthStatus.status === 'active' ? 'Hoạt động' : 
             healthStatus.status === 'busy' ? 'Bận' : 'Không rõ'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSystemHealth}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !health ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : health ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Người dùng</div>
                  <div className="font-semibold">{health.total_users}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Tư vấn</div>
                  <div className="font-semibold">{health.active_consultations}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Heart className="w-4 h-4 text-red-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Yêu thích</div>
                  <div className="font-semibold">{health.total_favorites}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Activity className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Hoạt động</div>
                  <div className="font-semibold">{health.admin_actions_today}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hoạt động cuối:</span>
                <span className="font-medium">{formatLastActivity(health.last_activity)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="font-medium">{lastUpdated.toLocaleTimeString('vi-VN')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Không thể tải dữ liệu hệ thống
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;