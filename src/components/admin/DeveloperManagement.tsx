import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Edit3, Trash2, Globe, Phone } from 'lucide-react';

type DeveloperRow = {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  established_year: number | null;
  website: string | null;
  hotline: string | null;
  email: string | null;
  address: string | null;
  total_projects: number;
  completed_projects: number;
  avg_legal_score: number | null;
  avg_rating: number | null;
  specialties: string[] | null;
  created_at: string;
  updated_at: string;
};

interface DeveloperManagementProps {
  developers: DeveloperRow[];
  onRefresh: () => void;
}

const DeveloperManagement = ({ developers, onRefresh }: DeveloperManagementProps) => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperRow | null>(null);

  const [newDev, setNewDev] = useState({
    name: '',
    hotline: '',
    website: '',
    email: '',
    address: '',
    established_year: '' as number | '' ,
    description: '',
    total_projects: 0,
    completed_projects: 0,
    avg_legal_score: '' as number | '' ,
    avg_rating: '' as number | '' ,
    specialties: '' as string | string[]
  });

  const resetNewDev = () => {
    setNewDev({
      name: '',
      hotline: '',
      website: '',
      email: '',
      address: '',
      established_year: '',
      description: '',
      total_projects: 0,
      completed_projects: 0,
      avg_legal_score: '',
      avg_rating: '',
      specialties: ''
    });
  };

  const handleCreate = async () => {
    try {
      const payload: any = {
        name: newDev.name.trim(),
        hotline: newDev.hotline?.trim() || null,
        website: newDev.website?.trim() || null,
        email: newDev.email?.trim() || null,
        address: newDev.address?.trim() || null,
        established_year: newDev.established_year === '' ? null : Number(newDev.established_year),
        description: newDev.description?.trim() || null,
        total_projects: Number(newDev.total_projects) || 0,
        completed_projects: Number(newDev.completed_projects) || 0,
        avg_legal_score: newDev.avg_legal_score === '' ? null : Number(newDev.avg_legal_score),
        avg_rating: newDev.avg_rating === '' ? null : Number(newDev.avg_rating),
        specialties: Array.isArray(newDev.specialties)
          ? newDev.specialties
          : (newDev.specialties ? (newDev.specialties as string).split(',').map(s => s.trim()).filter(Boolean) : null)
      };

      const { error } = await supabase.from('developers').insert([payload]);
      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã thêm chủ đầu tư mới' });
      setShowCreateDialog(false);
      resetNewDev();
      onRefresh();
    } catch (error) {
      console.error('Error creating developer:', error);
      toast({ title: 'Lỗi', description: 'Không thể tạo chủ đầu tư', variant: 'destructive' });
    }
  };

  const handleUpdate = async (updates: Partial<DeveloperRow>) => {
    if (!editingDeveloper) return;
    try {
      const cleanUpdates: any = { ...updates };
      if ('specialties' in cleanUpdates && typeof cleanUpdates.specialties === 'string') {
        cleanUpdates.specialties = (cleanUpdates.specialties as string).split(',').map(s => s.trim()).filter(Boolean);
      }
      const { error } = await supabase
        .from('developers')
        .update(cleanUpdates)
        .eq('id', editingDeveloper.id);

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã cập nhật chủ đầu tư' });
      setEditingDeveloper(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating developer:', error);
      toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đầu tư này?')) return;
    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã xóa chủ đầu tư' });
      onRefresh();
    } catch (error) {
      console.error('Error deleting developer:', error);
      toast({ title: 'Lỗi', description: 'Không thể xóa', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Quản lý Chủ đầu tư ({developers.length})
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm chủ đầu tư
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo chủ đầu tư mới</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên</label>
                  <Input value={newDev.name} onChange={(e) => setNewDev({ ...newDev, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Hotline</label>
                  <Input value={newDev.hotline} onChange={(e) => setNewDev({ ...newDev, hotline: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input value={newDev.website} onChange={(e) => setNewDev({ ...newDev, website: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={newDev.email} onChange={(e) => setNewDev({ ...newDev, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input value={newDev.address} onChange={(e) => setNewDev({ ...newDev, address: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Năm thành lập</label>
                  <Input
                    type="number"
                    value={newDev.established_year as number | ''}
                    onChange={(e) => setNewDev({ ...newDev, established_year: e.target.value ? Number(e.target.value) : '' })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea rows={3} value={newDev.description} onChange={(e) => setNewDev({ ...newDev, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Tổng dự án</label>
                  <Input
                    type="number"
                    value={newDev.total_projects}
                    onChange={(e) => setNewDev({ ...newDev, total_projects: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dự án hoàn thành</label>
                  <Input
                    type="number"
                    value={newDev.completed_projects}
                    onChange={(e) => setNewDev({ ...newDev, completed_projects: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Điểm pháp lý TB</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newDev.avg_legal_score as number | ''}
                    onChange={(e) => setNewDev({ ...newDev, avg_legal_score: e.target.value ? Number(e.target.value) : '' })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Đánh giá TB</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newDev.avg_rating as number | ''}
                    onChange={(e) => setNewDev({ ...newDev, avg_rating: e.target.value ? Number(e.target.value) : '' })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Chuyên môn (phân cách bằng dấu phẩy)</label>
                  <Input
                    placeholder="chung cư, khu đô thị, nghỉ dưỡng..."
                    value={Array.isArray(newDev.specialties) ? newDev.specialties.join(', ') : (newDev.specialties as string)}
                    onChange={(e) => setNewDev({ ...newDev, specialties: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Hủy</Button>
                <Button onClick={handleCreate}>Tạo</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Hotline</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Tổng dự án</TableHead>
                <TableHead>Hoàn thành</TableHead>
                <TableHead>Điểm pháp lý TB</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developers.map(dev => (
                <TableRow key={dev.id}>
                  <TableCell className="font-medium">{dev.name}</TableCell>
                  <TableCell className="text-sm flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {dev.hotline || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm flex items-center gap-1">
                    <Globe className="w-4 h-4" /> {dev.website || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dev.total_projects}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dev.completed_projects}</Badge>
                  </TableCell>
                  <TableCell>{dev.avg_legal_score ?? 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditingDeveloper(dev)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(dev.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {developers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Chưa có chủ đầu tư nào</div>
        )}

        {editingDeveloper && (
          <Dialog open={!!editingDeveloper} onOpenChange={() => setEditingDeveloper(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa chủ đầu tư</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên</label>
                  <Input
                    value={editingDeveloper.name}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hotline</label>
                  <Input
                    value={editingDeveloper.hotline || ''}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, hotline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={editingDeveloper.website || ''}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editingDeveloper.email || ''}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, email: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={editingDeveloper.address || ''}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Năm thành lập</label>
                  <Input
                    type="number"
                    value={editingDeveloper.established_year || 0}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, established_year: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea
                    rows={3}
                    value={editingDeveloper.description || ''}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tổng dự án</label>
                  <Input
                    type="number"
                    value={editingDeveloper.total_projects}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, total_projects: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dự án hoàn thành</label>
                  <Input
                    type="number"
                    value={editingDeveloper.completed_projects}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, completed_projects: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Điểm pháp lý TB</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingDeveloper.avg_legal_score ?? 0}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, avg_legal_score: Number(e.target.value || 0) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Đánh giá TB</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingDeveloper.avg_rating ?? 0}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, avg_rating: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Chuyên môn (phân cách bằng dấu phẩy)</label>
                  <Input
                    value={(editingDeveloper.specialties || []).join(', ')}
                    onChange={(e) => setEditingDeveloper({ ...editingDeveloper, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingDeveloper(null)}>Hủy</Button>
                <Button onClick={() => handleUpdate(editingDeveloper!)}>Lưu</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default DeveloperManagement;