"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';

interface ConsultationFormProps {
  project: Project;
  onClose: () => void;
}

const ConsultationForm = ({ project, onClose }: ConsultationFormProps) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Nghề nghiệp</Label>
        <Input
          id="occupation"
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budgetRange">Ngân sách dự kiến</Label>
        <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
          <SelectTrigger>
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
        <Label htmlFor="preferredContactTime">Thời gian liên hệ thuận tiện</Label>
        <Select value={formData.preferredContactTime} onValueChange={(value) => handleInputChange('preferredContactTime', value)}>
          <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="message">Tin nhắn</Label>
        <Textarea
          id="message"
          placeholder="Để lại lời nhắn hoặc câu hỏi của bạn..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Đang gửi...' : 'Đăng ký tư vấn'}
        </Button>
      </div>
    </form>
  );
};

export default ConsultationForm;
