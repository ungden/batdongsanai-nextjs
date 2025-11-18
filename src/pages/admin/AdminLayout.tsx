"use client";

import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const { isAdmin, loading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-4">Bạn cần quyền quản trị để truy cập khu vực này.</p>
          <Button onClick={() => navigate('/')}>
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;