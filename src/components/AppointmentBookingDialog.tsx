"use client";

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AppointmentBookingDialogProps {
  projectId?: string;
  projectName?: string;
  triggerButton?: React.ReactNode;
}

export const AppointmentBookingDialog = ({
  projectId,
  projectName,
  triggerButton
}: AppointmentBookingDialogProps) => {
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    appointment_type: 'site_visit' as 'site_visit' | 'consultation' | 'meeting',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    contact_phone: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }

    if (!formData.appointment_date || !formData.appointment_time) {
      toast.error('Vui lòng chọn ngày và giờ');
      return;
    }

    setLoading(true);

    try {
      const appointmentDateTime = new Date(
        `${formData.appointment_date}T${formData.appointment_time}`
      ).toISOString();

      await createAppointment({
        project_id: projectId,
        project_name: projectName,
        appointment_type: formData.appointment_type,
        appointment_date: appointmentDateTime,
        duration_minutes: formData.duration_minutes,
        status: 'pending',
        contact_phone: formData.contact_phone || undefined,
        notes: formData.notes || undefined
      });

      setOpen(false);
      setFormData({
        appointment_type: 'site_visit',
        appointment_date: '',
        appointment_time: '',
        duration_minutes: 60,
        contact_phone: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Đặt lịch hẹn
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt lịch hẹn</DialogTitle>
          <DialogDescription>
            {projectName
              ? `Đặt lịch cho dự án ${projectName}`
              : 'Đặt lịch tư vấn hoặc xem dự án'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Loại lịch hẹn</Label>
            <Select
              value={formData.appointment_type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, appointment_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site_visit">Xem dự án</SelectItem>
                <SelectItem value="consultation">Tư vấn</SelectItem>
                <SelectItem value="meeting">Họp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Giờ</Label>
              <Input
                id="time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) =>
                  setFormData({ ...formData, appointment_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Thời lượng</Label>
            <Select
              value={formData.duration_minutes.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, duration_minutes: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 phút</SelectItem>
                <SelectItem value="60">1 giờ</SelectItem>
                <SelectItem value="90">1.5 giờ</SelectItem>
                <SelectItem value="120">2 giờ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Số điện thoại liên hệ"
              value={formData.contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, contact_phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Thêm ghi chú cho cuộc hẹn..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang đặt...' : 'Đặt lịch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
