"use client";

import { useAdmin } from "@/hooks/useAdmin";
import UserManagement from "@/components/admin/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminUsers = () => {
  const { userRoles, updateUserRole, loading } = useAdmin();

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground">Phân quyền và quản lý tài khoản hệ thống</p>
      </div>
      <Card>
        <CardHeader>
           <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagement userRoles={userRoles} onUpdateRole={updateUserRole} />
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminUsers;