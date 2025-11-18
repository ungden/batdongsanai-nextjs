
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Phone, Mail } from 'lucide-react';

interface ConsultationRequest {
  id: string;
  project_id: string;
  project_name: string;
  full_name: string;
  phone: string;
  email: string;
  occupation: string | null;
  budget_range: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface ConsultationManagementProps {
  consultationRequests: ConsultationRequest[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const ConsultationManagement = ({ consultationRequests, onUpdateStatus, onDelete }: ConsultationManagementProps) => {
  const [filter, setFilter] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      contacted: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    } as const;

    const labels = {
      pending: 'Chờ xử lý',
      contacted: 'Đã liên hệ',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredRequests = consultationRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý yêu cầu tư vấn</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="contacted">Đã liên hệ</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Dự án</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ngân sách</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.full_name}</div>
                      {request.occupation && (
                        <div className="text-sm text-muted-foreground">{request.occupation}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48 truncate">
                      {request.project_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1" />
                        {request.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1" />
                        {request.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.budget_range || 'Chưa xác định'}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={request.status} 
                        onValueChange={(value) => onUpdateStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ xử lý</SelectItem>
                          <SelectItem value="contacted">Đã liên hệ</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa yêu cầu tư vấn</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa yêu cầu tư vấn này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(request.id)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không có yêu cầu tư vấn nào
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationManagement;
