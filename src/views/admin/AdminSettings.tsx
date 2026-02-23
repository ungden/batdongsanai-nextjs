import { useAdmin } from "@/hooks/useAdmin";
import SystemSettings from "@/components/admin/SystemSettings";

const AdminSettings = () => {
  const { systemSettings, updateSystemSetting } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">Cấu hình các tham số vận hành website</p>
      </div>
      <SystemSettings settings={systemSettings} onUpdate={updateSystemSetting} />
    </div>
  );
};
export default AdminSettings;