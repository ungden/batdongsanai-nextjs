import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  location: string;
  city: string;
  district: string;
  developer: string;
  image: string | null;
  status: string;
  price_range: string | null;
  price_per_sqm: number | null;
  completion_date: string | null;
  description: string | null;
  legal_score: number | null;
  total_units: number | null;
  sold_units: number | null;
  floors: number | null;
  amenities: string[] | null;
  apartment_types: string[] | null;
  launch_price: number | null;
  launch_date: string | null;
  current_price: number | null;
  created_at: string;
  updated_at: string;
}

interface ProjectManagementProps {
  projects: Project[];
  onRefresh: () => void;
}

const ProjectManagement = ({ projects, onRefresh }: ProjectManagementProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    city: '',
    district: '',
    developer: '',
    status: 'good',
    price_range: '',
    description: '',
    legal_score: 8
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      good: 'default',
      warning: 'secondary',
      danger: 'destructive'
    } as const;

    const labels = {
      good: 'Tốt',
      warning: 'Cảnh báo',
      danger: 'Rủi ro'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.status === filter
  );

  const handleCreateProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert([newProject]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo dự án mới",
      });

      setShowCreateDialog(false);
      setNewProject({
        name: '',
        location: '',
        city: '',
        district: '',
        developer: '',
        status: 'good',
        price_range: '',
        description: '',
        legal_score: 8
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo dự án",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật dự án",
      });

      onRefresh();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật dự án",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa dự án",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa dự án",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Quản lý dự án ({filteredProjects.length})
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm dự án
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo dự án mới</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên dự án</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nhà phát triển</label>
                  <Input
                    value={newProject.developer}
                    onChange={(e) => setNewProject({...newProject, developer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Thành phố</label>
                  <Input
                    value={newProject.city}
                    onChange={(e) => setNewProject({...newProject, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quận/Huyện</label>
                  <Input
                    value={newProject.district}
                    onChange={(e) => setNewProject({...newProject, district: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select value={newProject.status} onValueChange={(value) => setNewProject({...newProject, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Tốt</SelectItem>
                      <SelectItem value="warning">Cảnh báo</SelectItem>
                      <SelectItem value="danger">Rủi ro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Khoảng giá</label>
                  <Input
                    value={newProject.price_range}
                    onChange={(e) => setNewProject({...newProject, price_range: e.target.value})}
                    placeholder="VD: 2-5 tỷ"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Điểm pháp lý</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newProject.legal_score}
                    onChange={(e) => setNewProject({...newProject, legal_score: parseInt(e.target.value)})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateProject}>
                  Tạo dự án
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dự án</SelectItem>
              <SelectItem value="good">Dự án tốt</SelectItem>
              <SelectItem value="warning">Dự án cảnh báo</SelectItem>
              <SelectItem value="danger">Dự án rủi ro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dự án</TableHead>
                <TableHead>Nhà phát triển</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Điểm pháp lý</TableHead>
                <TableHead>Khoảng giá</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.developer}</TableCell>
                  <TableCell>{project.city}, {project.district}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <Badge variant={project.legal_score && project.legal_score >= 7 ? 'default' : 'secondary'}>
                      {project.legal_score}/10
                    </Badge>
                  </TableCell>
                  <TableCell>{project.price_range || 'N/A'}</TableCell>
                  <TableCell>{formatDate(project.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy dự án nào
          </div>
        )}

        {/* Edit Project Dialog */}
        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa dự án</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tên dự án</label>
                  <Input
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nhà phát triển</label>
                  <Input
                    value={editingProject.developer}
                    onChange={(e) => setEditingProject({...editingProject, developer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={editingProject.location}
                    onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select 
                    value={editingProject.status} 
                    onValueChange={(value) => setEditingProject({...editingProject, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Tốt</SelectItem>
                      <SelectItem value="warning">Cảnh báo</SelectItem>
                      <SelectItem value="danger">Rủi ro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingProject(null)}>
                  Hủy
                </Button>
                <Button onClick={() => {
                  handleUpdateProject(editingProject.id, editingProject);
                  setEditingProject(null);
                }}>
                  Cập nhật
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectManagement;