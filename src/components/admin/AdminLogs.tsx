
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from 'lucide-react';

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

interface AdminLogsProps {
  logs: AdminLog[];
}

const AdminLogs = ({ logs }: AdminLogsProps) => {
  const getActionBadge = (action: string) => {
    const variants = {
      UPDATE_USER_ROLE: 'secondary',
      UPDATE_SYSTEM_SETTING: 'default',
      UPDATE_CONSULTATION_STATUS: 'secondary',
      DELETE_CONSULTATION_REQUEST: 'destructive'
    } as const;

    const labels = {
      UPDATE_USER_ROLE: 'Cập nhật vai trò',
      UPDATE_SYSTEM_SETTING: 'Cài đặt hệ thống',
      UPDATE_CONSULTATION_STATUS: 'Cập nhật tư vấn',
      DELETE_CONSULTATION_REQUEST: 'Xóa yêu cầu tư vấn'
    };

    return (
      <Badge variant={variants[action as keyof typeof variants] || 'secondary'}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const truncateId = (id: string | null) => {
    if (!id) return '-';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Nhật ký hoạt động Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hành động</TableHead>
                <TableHead>Bảng</TableHead>
                <TableHead>Mục tiêu</TableHead>
                <TableHead>Admin ID</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    {log.target_table ? (
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {log.target_table}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {log.target_id ? (
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {truncateId(log.target_id)}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {truncateId(log.admin_id)}
                    </code>
                  </TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có hoạt động nào
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLogs;
