import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building, Plus, Edit3, Trash2, Eye, EyeOff, Image as ImageIcon, Upload, X } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    city: '',
    district: '',
    developer: '',
    image: '',
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `project-images/${fileName}`;

      // Try uploading to 'public' bucket first as a common convention or 'project-images' if you have it.
      // For this codebase, let's assume a bucket named 'project-images' exists or we use a general one.
      // Since we can't easily know which buckets exist without checking, we'll try 'project-images'.
      // If it fails, we might need to create it or use another one.
      
      const { error: uploadError } = await supabase.storage
        .from('project-images') 
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
         // If bucket doesn't exist, this will fail. 
         // In a real scenario we'd handle bucket creation or use a known bucket.
         throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      if (isEditing && editingProject) {
        setEditingProject({ ...editingProject, image: publicUrl });
      } else {
        setNewProject({ ...newProject, image: publicUrl });
      }

      toast({
        title: "Thành công",
        description: "Đã tải lên hình ảnh",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Lỗi tải ảnh",
        description: error.message || "Có lỗi xảy ra khi tải lên hình ảnh",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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
        image: '',
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
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Hình ảnh dự án</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden bg-muted/10 relative group">
                      {newProject.image ? (
                        <>
                          <img src={newProject.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewProject({ ...newProject, image: '' });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hỗ trợ JPG, PNG. Tối đa 5MB.
                      </p>
                      <div className="mt-2">
                         <p className="text-xs font-medium mb-1">Hoặc nhập URL:</p>
                         <Input 
                            value={newProject.image || ''} 
                            onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="h-8 text-xs"
                         />
                      </div>
                    </div>
                  </div>
                </div>

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
                <Button onClick={handleCreateProject} disabled={uploading}>
                  {uploading ? 'Đang tải ảnh...' : 'Tạo dự án'}
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
                <TableHead className="w-[50px]">Ảnh</TableHead>
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
                  <TableCell>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {project.image ? (
                        <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>
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
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Hình ảnh dự án</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden bg-muted/10 relative group">
                      {editingProject.image ? (
                        <>
                          <img src={editingProject.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProject({ ...editingProject, image: '' });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hỗ trợ JPG, PNG. Tối đa 5MB.
                      </p>
                      <div className="mt-2">
                         <p className="text-xs font-medium mb-1">Hoặc nhập URL:</p>
                         <Input 
                            value={editingProject.image || ''} 
                            onChange={(e) => setEditingProject({...editingProject, image: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                            className="h-8 text-xs"
                         />
                      </div>
                    </div>
                  </div>
                </div>

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
                }} disabled={uploading}>
                  {uploading ? 'Đang tải ảnh...' : 'Cập nhật'}
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