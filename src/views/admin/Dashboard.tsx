import { useRouter } from 'next/navigation';

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
import DataManagement from '@/views/admin/DataManagement';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Activity, Users, Settings, FileText, AlertTriangle, Newspaper, Database, ArrowRight } from 'lucide-react';


const AdminDashboard = () => {
  const navigate = useRouter();
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
          <Button 
            onClick={() => navigate.push('/admin/data-management')}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            <Database className="w-4 h-4 mr-2" />
            Quản lý Dữ liệu (Seed)
          </Button>
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

      {/* Set default value to 'data' so you see it immediately */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="flex w-full h-auto p-1 bg-muted overflow-x-auto flex-nowrap justify-start no-scrollbar">
          <TabsTrigger value="data" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2 font-bold text-blue-700 data-[state=active]:bg-blue-100">
            <Database className="w-4 h-4" /> DỮ LIỆU & SEED
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <BarChart3 className="w-4 h-4" /> Phân tích
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <FileText className="w-4 h-4" /> Dự án
          </TabsTrigger>
          <TabsTrigger value="developers" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Users className="w-4 h-4" /> Chủ đầu tư
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Activity className="w-4 h-4" /> Tư vấn
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <FileText className="w-4 h-4" /> Nội dung
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Newspaper className="w-4 h-4" /> Tin tức
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Users className="w-4 h-4" /> Người dùng
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Settings className="w-4 h-4" /> Cài đặt
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1 text-xs whitespace-nowrap px-3 py-2">
            <Shield className="w-4 h-4" /> Nhật ký
          </TabsTrigger>
        </TabsList>

        {/* New Data Management Tab - Placed First */}
        <TabsContent value="data" className="mt-4">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Khu vực Quản lý Dữ liệu</h3>
                <p className="text-sm text-blue-700">Tại đây bạn có thể Seed dữ liệu mẫu, Xóa dữ liệu cũ, Import/Export file.</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200" onClick={() => navigate.push('/admin/data-management')}>
              Mở toàn màn hình <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <DataManagement />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
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
      </Tabs>
    </div>
  );
};

export default AdminDashboard;