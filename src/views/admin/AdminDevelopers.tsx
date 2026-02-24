"use client";

import { useAdmin } from "@/hooks/useAdmin";
import DeveloperManagement from "@/components/admin/DeveloperManagement";

const AdminDevelopers = () => {
  const { developers, refetch } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Chủ đầu tư</h1>
        <p className="text-muted-foreground">Danh sách đối tác và chủ đầu tư</p>
      </div>
      <DeveloperManagement developers={developers} onRefresh={refetch.developers} />
    </div>
  );
};
export default AdminDevelopers;