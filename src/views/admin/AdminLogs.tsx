"use client";

import { useAdmin } from "@/hooks/useAdmin";
import AdminLogsComponent from "@/components/admin/AdminLogs";

const AdminLogsPage = () => {
  const { adminLogs } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nhật ký hoạt động</h1>
        <p className="text-muted-foreground">Theo dõi các thao tác của quản trị viên</p>
      </div>
      <AdminLogsComponent logs={adminLogs} />
    </div>
  );
};
export default AdminLogsPage;