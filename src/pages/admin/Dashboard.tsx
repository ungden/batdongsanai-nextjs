import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminStats from '@/components/admin/AdminStats';
import ConsultationManagement from '@/components/admin/ConsultationManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import UserManagement from '@/components/admin/UserManagement';
import AdminLogs from '@/components/admin/AdminLogs';
import WebsiteAnalytics from '@/components/admin/WebsiteAnalytics';
import ContentManagement from '@/components/admin/ContentManagement';
import ProjectManagement from '@/components/admin/ProjectManagement';
import NewsManagement from '@/components/admin/NewsManagement';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';
import RealTimeAnalytics from '@/components/admin/RealTimeAnalytics';
import DeveloperManagement from '@/components/admin/DeveloperManagement';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Activity, Users, Settings, FileText, AlertTriangle, Newspaper } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    userRoles,
    adminLogs,
    systemSettings,
    consultationRequests,
    projects,
    developers,
    updateUserRole,
    updateSystemSetting,
    updateConsultationStatus,
    deleteConsultationRequest,
    refetch
  } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Quản Trị</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống Realprofit.vn</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            1 cảnh báo
          </Badge>
          <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Ổn định
          </Badge>
        </div>
      </div>

      <AdminStats
        userCount={userRoles.length}
        consultationCount={consultationRequests.length}
        settingsCount={systemSettings.length}
        viewCount={0}
      />

      <SystemHealthMonitor />

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-10 h-10">
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-4 h-4" />
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-1 text-xs">
            <Activity className="w-4 h-4" />
            Tư vấn
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 text-xs">
            <Users className="w-4 h-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="developers" className="flex items-center gap-1 text-xs">
            <Users className="w-4 h-4" />
            Chủ đầu tư
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1 text-xs">
            <FileText className="w-4 h-4" />
            Dự án
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1 text-xs">
            <FileText className="w-4 h-4" />
            Nội dung
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-1 text-xs">
            <Newspaper className="w-4 h-4" />
            Tin tức
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 text-xs">
            <Settings className="w-4 h-4" />
            Cài đặt
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1 text-xs">
            <Shield className="w-4 h-4" />
            Nhật ký
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-1 text-xs">
            <Activity className="w-4 h-4" />
            Hệ thống
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <RealTimeAnalytics />
          <WebsiteAnalytics />
        </TabsContent>

        <TabsContent value="consultations" className="mt-4">
          <ConsultationManagement
            consultationRequests={consultationRequests}
            onUpdateStatus={updateConsultationStatus}
            onDelete={deleteConsultationRequest}
          />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UserManagement
            userRoles={userRoles}
            onUpdateRole={updateUserRole}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <ProjectManagement 
            projects={projects}
            onRefresh={refetch.projects}
          />
        </TabsContent>

        <TabsContent value="developers" className="mt-4">
          <DeveloperManagement 
            developers={developers}
            onRefresh={refetch.developers}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="news" className="mt-4">
          <NewsManagement />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SystemSettings
            settings={systemSettings}
            onUpdate={updateSystemSetting}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <AdminLogs logs={adminLogs} />
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tình trạng hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database</span>
                  <Badge variant="default" className="text-xs">Hoạt động</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>API Services</span>
                  <Badge variant="default" className="text-xs">Hoạt động</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cache System</span>
                  <Badge variant="default" className="text-xs">Hoạt động</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Bảo trì hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full h-9">
                  Xóa cache
                </Button>
                <Button variant="outline" size="sm" className="w-full h-9">
                  Backup database
                </Button>
                <Button variant="destructive" size="sm" className="w-full h-9">
                  Bảo trì hệ thống
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;