"use client";

import { useState } from 'react';
import { useContent, type ContentItem } from '@/hooks/useContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Calendar, User, Sparkles, Loader2, Wand2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { projectsData } from '@/data/projectsData'; // Import project data for context

const NewsManagement = () => {
  const { contentItems, loading, createContentItem, updateContentItem, deleteContentItem } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  
  // New AI Options
  const [selectedProject, setSelectedProject] = useState<string>('none');
  const [selectedTone, setSelectedTone] = useState<string>('chuyên nghiệp, khách quan');

  const tones = [
    { value: 'chuyên nghiệp, khách quan', label: 'Chuyên nghiệp' },
    { value: 'hào hứng, bán hàng', label: 'Quảng cáo/Bán hàng' },
    { value: 'phân tích sâu sắc', label: 'Phân tích chuyên sâu' },
    { value: 'thân thiện, dễ hiểu', label: 'Blog/Chia sẻ' },
    { value: 'cảnh báo, thận trọng', label: 'Cảnh báo rủi ro' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    status: 'draft',
    featured_image: '',
    priority: 0
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      status: 'draft',
      featured_image: '',
      priority: 0
    });
    setIsEditing(false);
    setEditingItem(null);
    setShowAiInput(false);
    setAiPrompt('');
    setSelectedProject('none');
    setSelectedTone('chuyên nghiệp, khách quan');
  };

  const handleAiGenerate = async (mode: 'generate' | 'optimize' = 'generate') => {
    if (mode === 'generate' && !aiPrompt.trim() && selectedProject === 'none') {
      toast.error('Vui lòng nhập chủ đề hoặc chọn dự án');
      return;
    }
    
    if (mode === 'optimize' && !formData.content) {
      toast.error('Cần có nội dung để tối ưu hóa');
      return;
    }

    setIsGenerating(true);
    try {
      // Prepare context from project if selected
      let contextData = '';
      if (selectedProject !== 'none') {
        const proj = projectsData.find(p => p.id === selectedProject);
        if (proj) {
          contextData = `DỰ ÁN: ${proj.name}, Vị trí: ${proj.location}, Chủ đầu tư: ${proj.developer}, Giá: ${proj.priceRange}, Tiện ích: ${proj.amenities?.join(', ')}`;
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          action: mode,
          topic: aiPrompt,
          content: mode === 'optimize' ? formData.content : undefined,
          context: contextData,
          type: 'news',
          tone: selectedTone,
          language: 'vi-VN'
        }
      });

      if (error) throw error;

      const result = data.data;
      
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        content: result.content || prev.content,
        meta_title: result.meta_title || result.title || prev.meta_title,
        meta_description: result.meta_description || result.summary || prev.meta_description,
        keywords: Array.isArray(result.keywords) ? result.keywords.join(', ') : (result.keywords || prev.keywords),
      }));

      if (result.improvements) {
        toast.success(`Đã tối ưu! Cải thiện: ${result.improvements.length} điểm.`);
      } else {
        toast.success('Đã tạo nội dung thành công!');
      }
      
      if (mode === 'generate') setShowAiInput(false);
    } catch (error: any) {
      console.error(error);
      toast.error('Lỗi AI: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contentData: Partial<ContentItem> = {
        title: formData.title,
        content: formData.content,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        status: formData.status as ContentItem['status'],
        featured_image: formData.featured_image,
        priority: formData.priority,
        type: 'news' as const,
      };

      if (isEditing && editingItem) {
        await updateContentItem(editingItem.id, contentData);
        toast.success('Cập nhật tin tức thành công!');
      } else {
        await createContentItem(contentData);
        toast.success('Tạo tin tức mới thành công!');
      }
      resetForm();
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      status: item.status || 'draft',
      featured_image: item.featured_image || '',
      priority: item.priority || 0
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        await deleteContentItem(id);
        toast.success('Xóa tin tức thành công!');
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa.');
      }
    }
  };

  const newsItems = contentItems.filter(item => item.type === 'news');
  
  const filteredItems = newsItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>;
      case 'archived':
        return <Badge variant="outline">Lưu trữ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản Lý Tin Tức Bất Động Sản</h2>
          <p className="text-muted-foreground">Tạo và quản lý tin tức, bài viết về thị trường bất động sản</p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button onClick={() => {
              resetForm();
              setIsEditing(true);
              setShowAiInput(true);
            }} variant="outline" className="border-dashed border-primary text-primary hover:bg-primary/10">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Soạn thảo nhanh
            </Button>
          )}
          <Button onClick={() => {
            resetForm();
            setIsEditing(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tin tức mới
          </Button>
        </div>
      </div>

      {/* Form tạo/chỉnh sửa */}
      {isEditing && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingItem ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAiInput(!showAiInput)}
                className="text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {showAiInput ? 'Ẩn công cụ AI' : 'Mở công cụ AI'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAiInput && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-primary/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center text-primary">
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI Content Generator
                  </h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowAiInput(false)} className="h-6 w-6 p-0">
                    &times;
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Dự án liên quan (Ngữ cảnh)</label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Chọn dự án để viết bài..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không chọn dự án --</SelectItem>
                        {projectsData.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Giọng văn (Tone)</label>
                    <Select value={selectedTone} onValueChange={setSelectedTone}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Chủ đề / Từ khóa chính</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="VD: Xu hướng đầu tư Quận 9, Phân tích pháp lý..." 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="bg-background"
                    />
                    <Button onClick={() => handleAiGenerate('generate')} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Viết bài
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* AI Toolbar for Content */}
              <div className="flex justify-end gap-2 mb-[-10px] relative z-10">
                {formData.content && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    className="h-7 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                    onClick={() => handleAiGenerate('optimize')}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                    AI Tối ưu SEO & Văn phong
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề tin tức *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tiêu đề tin tức..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="active">Xuất bản</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung tin tức *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung tin tức..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Hình ảnh đại diện</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="URL hình ảnh..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Độ ưu tiên</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Từ khóa SEO</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="bất động sản, thị trường, đầu tư..."
                />
                <p className="text-sm text-muted-foreground">Phân cách bằng dấu phẩy</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Tiêu đề cho SEO..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Mô tả cho SEO..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? 'Cập nhật' : 'Tạo tin tức'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bộ lọc */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách tin tức */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Chưa có tin tức nào.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {getStatusBadge(item.status)}
                      {item.priority !== null && item.priority > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          Ưu tiên: {item.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {item.content?.substring(0, 200)}...
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </div>
                      {item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>Từ khóa:</span>
                          <span className="text-primary">{item.keywords.slice(0, 3).join(', ')}</span>
                          {item.keywords.length > 3 && <span>...</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {item.featured_image && (
                      <img loading="lazy" decoding="async" 
                        src={item.featured_image} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{newsItems.length}</div>
            <p className="text-sm text-muted-foreground">Tổng tin tức</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {newsItems.filter(item => item.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Đã xuất bản</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {newsItems.filter(item => item.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">Bản nháp</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
               {newsItems.filter(item => item.priority !== null && item.priority > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">Tin nổi bật</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsManagement;