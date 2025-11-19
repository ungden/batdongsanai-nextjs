import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Image,
  Settings,
  AlertTriangle,
  Save,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Sparkles,
  Loader2,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/hooks/useContent';
import { supabase } from '@/integrations/supabase/client';

interface ContentManagementProps {
  className?: string;
}

const ContentManagement = ({ className }: ContentManagementProps) => {
  const { toast } = useToast();
  const { 
    contentItems, 
    siteSettings, 
    mediaFiles, 
    loading,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    updateSiteSetting
  } = useContent();
  
  const [activeTab, setActiveTab] = useState('pages');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // AI State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiTool, setShowAiTool] = useState(false);
  const [aiTone, setAiTone] = useState('chuyên nghiệp');

  const [newItem, setNewItem] = useState({
    type: 'page' as 'page' | 'banner' | 'announcement' | 'seo',
    title: '',
    content: '',
    slug: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    meta_title: '',
    meta_description: ''
  });

  const handleAiGenerate = async (target: 'new' | 'edit') => {
    const prompt = aiPrompt;
    if (!prompt.trim()) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập chủ đề hoặc yêu cầu.", variant: "destructive" });
      return;
    }

    setIsAiGenerating(true);
    try {
      const itemType = target === 'new' ? newItem.type : (editingItem?.type || 'page');
      
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          topic: prompt,
          type: itemType,
          tone: aiTone,
          language: 'vi-VN'
        }
      });

      if (error) throw error;
      const result = data.data;

      if (target === 'new') {
        setNewItem(prev => ({
          ...prev,
          title: result.title || prev.title,
          content: result.content || prev.content,
          slug: result.slug || prev.slug,
          meta_description: result.meta_description || prev.meta_description,
        }));
      } else if (editingItem) {
        setEditingItem((prev: any) => ({
          ...prev,
          title: result.title || prev.title,
          content: result.content || prev.content,
          slug: result.slug || prev.slug,
        }));
      }

      toast({ title: "AI hoàn tất", description: "Đã tạo nội dung thành công." });
      setAiPrompt('');
      setShowAiTool(false);
    } catch (e: any) {
      toast({ title: "Lỗi AI", description: e.message, variant: "destructive" });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreate = async () => {
    await createContentItem(newItem);
    setShowCreateDialog(false);
    setNewItem({
      type: 'page',
      title: '',
      content: '',
      slug: '',
      status: 'draft',
      meta_title: '',
      meta_description: ''
    });
  };

  const handleSave = async (item: any) => {
    await updateContentItem(item.id, item);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    await deleteContentItem(id);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;

    const labels = {
      active: 'Đang hoạt động',
      draft: 'Nháp',
      archived: 'Đã lưu trữ'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredContent = (type: string) => 
    contentItems.filter(item => type === 'all' || item.type === type);

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quản lý nội dung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pages">Trang web</TabsTrigger>
              <TabsTrigger value="banners">Banner</TabsTrigger>
              <TabsTrigger value="announcements">Thông báo</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Nội dung trang web</h3>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewItem({...newItem, type: 'page'})}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo mới
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              {filteredContent('page').map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="banners" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quản lý Banner</h3>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewItem({...newItem, type: 'banner'})}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm banner
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              {filteredContent('banner').map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="announcements" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Thông báo hệ thống</h3>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setNewItem({...newItem, type: 'announcement'})}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo thông báo
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Thông báo sẽ hiển thị trên toàn bộ website và gửi qua email cho người dùng đã đăng ký.
                </AlertDescription>
              </Alert>
              
              {filteredContent('announcement').map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                  </p>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quản lý Media ({mediaFiles.length})</h3>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaFiles.length > 0 ? (
                  mediaFiles.map((file) => (
                    <div key={file.id} className="aspect-square bg-muted rounded-lg relative group">
                      {file.mime_type.startsWith('image/') ? (
                        <img 
                          src={file.file_path} 
                          alt={file.alt_text || file.original_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs text-center p-2">
                          <p className="font-medium">{file.original_name}</p>
                          <p className="text-white/80">{(file.file_size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8 text-muted-foreground">
                    Chưa có file media nào
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cài đặt website</h3>
              </div>
              
              <div className="grid gap-4">
                {Object.entries(
                  siteSettings.reduce((acc, setting) => {
                    if (!acc[setting.section]) acc[setting.section] = [];
                    acc[setting.section].push(setting);
                    return acc;
                  }, {} as Record<string, typeof siteSettings>)
                ).map(([section, settings]) => (
                  <Card key={section}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{section}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{setting.key.replace(/_/g, ' ')}</p>
                            {setting.description && (
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            )}
                          </div>
                          <div className="w-64">
                            <Input
                              value={setting.value}
                              onChange={(e) => updateSiteSetting(setting.section, setting.key, e.target.value)}
                              placeholder={`Nhập ${setting.key}`}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Create Content Dialog */}
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo nội dung mới</DialogTitle>
            </DialogHeader>

            {/* AI Tool Section */}
            <div className="bg-muted/30 p-3 rounded-md border border-dashed mb-4">
              <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setShowAiTool(!showAiTool)}>
                <div className="flex items-center text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sử dụng AI để tạo nội dung tự động
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  {showAiTool ? 'Ẩn' : 'Hiện'}
                </Button>
              </div>
              
              {showAiTool && (
                <div className="space-y-3 animate-in slide-in-from-top-2 mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Input 
                        placeholder="Nhập chủ đề (VD: Trang giới thiệu công ty...)" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                    </div>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                    >
                      <option value="chuyên nghiệp">Chuyên nghiệp</option>
                      <option value="thân thiện">Thân thiện</option>
                      <option value="hào hứng">Hào hứng (Sale)</option>
                      <option value="trang trọng">Trang trọng</option>
                    </select>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAiGenerate('new')} 
                    disabled={isAiGenerating || !aiPrompt}
                    className="w-full"
                  >
                    {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Tạo nội dung ngay
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Loại nội dung</label>
                <Select value={newItem.type} onValueChange={(value: any) => setNewItem({...newItem, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Trang web</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="announcement">Thông báo</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input 
                  value={newItem.title} 
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input 
                  value={newItem.slug} 
                  onChange={(e) => setNewItem({...newItem, slug: e.target.value})}
                  placeholder="vd: trang-chu"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nội dung</label>
                <Textarea 
                  value={newItem.content}
                  onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={newItem.status} onValueChange={(value: any) => setNewItem({...newItem, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreate}>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo
                </Button>
              </div>
            </div>
          </DialogContent>

          {/* Edit Modal */}
          {editingItem && (
            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa nội dung</DialogTitle>
                </DialogHeader>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAiTool(!showAiTool)}
                    className="text-primary border-primary/30"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    AI Hỗ trợ
                  </Button>
                </div>

                {showAiTool && (
                   <div className="bg-muted/30 p-3 rounded-md border border-dashed mb-2">
                    <div className="space-y-2">
                      <Input 
                        placeholder="Yêu cầu sửa đổi (VD: Viết lại trang trọng hơn...)" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleAiGenerate('edit')} 
                        disabled={isAiGenerating || !aiPrompt}
                        className="w-full"
                      >
                        {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Thực hiện'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tiêu đề</label>
                    <Input 
                      value={editingItem.title} 
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nội dung</label>
                    <Textarea 
                      value={editingItem.content || ''}
                      onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select value={editingItem.status} onValueChange={(value: any) => setEditingItem({...editingItem, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nháp</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="archived">Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingItem(null)}>
                      Hủy
                    </Button>
                    <Button onClick={() => handleSave(editingItem)}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;