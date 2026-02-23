import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Building2, Calendar, TrendingUp } from 'lucide-react';

interface ImprovedConsultationFormProps {
  project: Project;
  onClose: () => void;
}

const ImprovedConsultationForm = ({ project, onClose }: ImprovedConsultationFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    occupation: '',
    budgetRange: '',
    preferredContactTime: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('consultation_requests')
        .insert({
          project_id: project.id,
          project_name: project.name,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          occupation: formData.occupation,
          budget_range: formData.budgetRange,
          preferred_contact_time: formData.preferredContactTime,
          message: formData.message
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Đăng ký thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold text-foreground mb-3">Đăng ký tư vấn dự án</h2>
          
          {/* Project Summary Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img loading="lazy" decoding="async" 
                  src={project.image} 
                  alt={project.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{project.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{project.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">Giá: {project.priceRange}</span>
                    </div>
                    {project.averageRentalPrice && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">Thuê: {project.averageRentalPrice}/th</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <ScrollArea className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="0xxx xxx xxx"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-sm font-medium">Nghề nghiệp</Label>
            <Input
              id="occupation"
              placeholder="Ví dụ: Kỹ sư IT, Bác sĩ, Kinh doanh..."
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetRange" className="text-sm font-medium">Ngân sách dự kiến</Label>
              <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn mức ngân sách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-2-billion">Dưới 2 tỷ</SelectItem>
                  <SelectItem value="2-3-billion">2-3 tỷ</SelectItem>
                  <SelectItem value="3-5-billion">3-5 tỷ</SelectItem>
                  <SelectItem value="5-10-billion">5-10 tỷ</SelectItem>
                  <SelectItem value="above-10-billion">Trên 10 tỷ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactTime" className="text-sm font-medium">Thời gian liên hệ thuận tiện</Label>
              <Select value={formData.preferredContactTime} onValueChange={(value) => handleInputChange('preferredContactTime', value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Buổi sáng (8h-12h)</SelectItem>
                  <SelectItem value="afternoon">Buổi chiều (13h-17h)</SelectItem>
                  <SelectItem value="evening">Buổi tối (18h-21h)</SelectItem>
                  <SelectItem value="weekend">Cuối tuần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Tin nhắn</Label>
            <Textarea
              id="message"
              placeholder="Để lại lời nhắn hoặc câu hỏi của bạn về dự án..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </form>
      </ScrollArea>

      {/* Footer - Fixed */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6 pt-4">
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-11"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !formData.fullName || !formData.phone || !formData.email} 
              className="flex-1 h-11"
            >
              {loading ? 'Đang gửi...' : 'Đăng ký tư vấn'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Thông tin của bạn sẽ được bảo mật tuyệt đối
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImprovedConsultationForm;