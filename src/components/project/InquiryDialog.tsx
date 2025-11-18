import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectInquiries, InquiryFormData } from '@/hooks/useProjectInquiries';
import { MessageSquare, Phone, Calendar, DollarSign } from 'lucide-react';

interface InquiryDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

export function InquiryDialog({ projectId, projectName, trigger }: InquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const { submitInquiry, submitting } = useProjectInquiries();

  const [formData, setFormData] = useState<InquiryFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    inquiry_type: 'general',
    message: '',
    budget_min: undefined,
    budget_max: undefined,
    preferred_bedrooms: undefined,
    move_in_timeline: '',
    how_did_you_hear: '',
    preferred_contact_time: 'anytime',
  });

  const handleInputChange = (field: keyof InquiryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success } = await submitInquiry(projectId, formData);

    if (success) {
      setOpen(false);
      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        inquiry_type: 'general',
        message: '',
        budget_min: undefined,
        budget_max: undefined,
        preferred_bedrooms: undefined,
        move_in_timeline: '',
        how_did_you_hear: '',
        preferred_contact_time: 'anytime',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full">
            <MessageSquare className="mr-2 h-5 w-5" />
            Tôi quan tâm
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đăng ký tư vấn</DialogTitle>
          <DialogDescription>
            Để lại thông tin để được tư vấn chi tiết về <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Thông tin liên hệ
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Họ tên *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="customer_phone">Số điện thoại *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
              />
            </div>
          </div>

          {/* Inquiry Type */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Nhu cầu tư vấn
            </h3>

            <div>
              <Label htmlFor="inquiry_type">Loại yêu cầu</Label>
              <Select
                value={formData.inquiry_type}
                onValueChange={(value: any) => handleInputChange('inquiry_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Tư vấn chung</SelectItem>
                  <SelectItem value="viewing">Đặt lịch xem nhà</SelectItem>
                  <SelectItem value="pricing">Tư vấn giá & chính sách</SelectItem>
                  <SelectItem value="purchase">Quan tâm mua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Tin nhắn</Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="Chia sẻ thêm về nhu cầu của bạn..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Yêu cầu (tùy chọn)
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Ngân sách từ (VNĐ)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  placeholder="VD: 3000000000"
                  value={formData.budget_min || ''}
                  onChange={(e) => handleInputChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label htmlFor="budget_max">Ngân sách đến (VNĐ)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  placeholder="VD: 5000000000"
                  value={formData.budget_max || ''}
                  onChange={(e) => handleInputChange('budget_max', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_bedrooms">Số phòng ngủ mong muốn</Label>
                <Select
                  value={formData.preferred_bedrooms?.toString() || ''}
                  onValueChange={(value) => handleInputChange('preferred_bedrooms', value ? Number(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không xác định</SelectItem>
                    <SelectItem value="1">1 phòng</SelectItem>
                    <SelectItem value="2">2 phòng</SelectItem>
                    <SelectItem value="3">3 phòng</SelectItem>
                    <SelectItem value="4">4+ phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="move_in_timeline">Thời gian dự kiến chuyển vào</Label>
                <Select
                  value={formData.move_in_timeline}
                  onValueChange={(value) => handleInputChange('move_in_timeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Chưa xác định</SelectItem>
                    <SelectItem value="immediate">Ngay lập tức</SelectItem>
                    <SelectItem value="1-3_months">1-3 tháng</SelectItem>
                    <SelectItem value="3-6_months">3-6 tháng</SelectItem>
                    <SelectItem value="6-12_months">6-12 tháng</SelectItem>
                    <SelectItem value="12+_months">Trên 12 tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin bổ sung
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_contact_time">Thời gian liên hệ thuận tiện</Label>
                <Select
                  value={formData.preferred_contact_time}
                  onValueChange={(value) => handleInputChange('preferred_contact_time', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Bất kỳ lúc nào</SelectItem>
                    <SelectItem value="morning">Buổi sáng (8h-12h)</SelectItem>
                    <SelectItem value="afternoon">Buổi chiều (12h-18h)</SelectItem>
                    <SelectItem value="evening">Buổi tối (18h-21h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="how_did_you_hear">Bạn biết đến dự án qua?</Label>
                <Select
                  value={formData.how_did_you_hear}
                  onValueChange={(value) => handleInputChange('how_did_you_hear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Khác</SelectItem>
                    <SelectItem value="google">Google Search</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="friend">Bạn bè giới thiệu</SelectItem>
                    <SelectItem value="agent">Tư vấn viên</SelectItem>
                    <SelectItem value="billboard">Billboard/Biển quảng cáo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            <p>
              Thông tin của bạn sẽ được chuyển đến các tư vấn viên BĐS chuyên nghiệp.
              Họ sẽ liên hệ với bạn trong vòng 24 giờ.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi thông tin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
