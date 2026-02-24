"use client";

import { useAdmin } from "@/hooks/useAdmin";
import ProjectManagement from "@/components/admin/ProjectManagement";

const AdminProjects = () => {
  const { projects, refetch } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý dự án</h1>
        <p className="text-muted-foreground">Thêm, sửa, xóa thông tin các dự án bất động sản</p>
      </div>
      <ProjectManagement projects={projects} onRefresh={refetch.projects} />
    </div>
  );
};
export default AdminProjects;