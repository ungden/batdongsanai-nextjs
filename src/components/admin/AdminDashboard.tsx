import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, Users, Settings, BarChart3, FileText, AlertTriangle } from 'lucide-react';
import AdminStats from './AdminStats';
import SystemHealthMonitor from './SystemHealthMonitor';
import RealTimeAnalytics from './RealTimeAnalytics';
import WebsiteAnalytics from './WebsiteAnalytics';
import ConsultationManagement from './ConsultationManagement';
import UserManagement from './UserManagement';
import ContentManagement from './ContentManagement';
import SystemSettings from './SystemSettings';
import AdminLogs from './AdminLogs';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard = ({ className }: AdminDashboardProps) => {
  const {
    userRoles,
    adminLogs,
    systemSettings,
    consultationRequests,
    updateUserRole,
    updateSystemSetting,
    updateConsultationStatus,
    deleteConsultationRequest
  } = useAdmin();

  const stats = {
    userCount: userRoles.length,
    consultationCount: consultationRequests.length,
    settingsCount: systemSettings.length,
    viewCount: 0 // This would come from analytics
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with security status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Quản lý toàn diện hệ thống website</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            1 cảnh báo bảo mật
          </Badge>
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Hệ thống ổn định
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <AdminStats
        userCount={stats.userCount}
        consultationCount={stats.consultationCount}
        settingsCount={stats.settingsCount}
        viewCount={stats.viewCount}
      />

      {/* System Health Monitor */}
      <SystemHealthMonitor />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Tư vấn
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cài đặt
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Nhật ký
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <RealTimeAnalytics />
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý yêu cầu tư vấn</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultationManagement
                consultationRequests={consultationRequests}
                onUpdateStatus={updateConsultationStatus}
                onDelete={deleteConsultationRequest}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý người dùng và vai trò</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement
                userRoles={userRoles}
                onUpdateRole={updateUserRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý nội dung</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemSettings
                settings={systemSettings}
                onUpdate={updateSystemSetting}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động quản trị</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminLogs logs={adminLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích website tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              <WebsiteAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;