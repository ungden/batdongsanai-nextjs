
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Shield, User as UserIcon } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_at: string;
}

interface UserManagementProps {
  userRoles: UserRole[];
  onUpdateRole: (userId: string, role: 'admin' | 'moderator' | 'user') => void;
}

const UserManagement = ({ userRoles, onUpdateRole }: UserManagementProps) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [filter, setFilter] = useState<string>('all');

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      moderator: 'secondary',
      user: 'secondary'
    } as const;

    const labels = {
      admin: 'Quản trị viên',
      moderator: 'Điều hành viên',
      user: 'Người dùng'
    };

    const icons = {
      admin: Shield,
      moderator: UserPlus,
      user: UserIcon
    };

    const Icon = icons[role as keyof typeof icons] || UserIcon;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const filteredUsers = userRoles.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const handleAddUser = () => {
    if (newUserId.trim()) {
      onUpdateRole(newUserId.trim(), newUserRole);
      setNewUserId('');
      setNewUserRole('user');
      setShowAddUser(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý người dùng</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="moderator">Điều hành viên</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm vai trò
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Phân quyền người dùng</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      placeholder="Nhập User ID..."
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Lấy User ID từ bảng auth.users trong Supabase
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <Select value={newUserRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setNewUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="moderator">Điều hành viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddUser(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddUser}>
                      Phân quyền
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày phân quyền</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {user.user_id.substring(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{formatDate(user.assigned_at)}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: 'admin' | 'moderator' | 'user') => onUpdateRole(user.user_id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Người dùng</SelectItem>
                        <SelectItem value="moderator">Điều hành viên</SelectItem>
                        <SelectItem value="admin">Quản trị viên</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không có người dùng nào
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
