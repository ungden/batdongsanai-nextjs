import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoAppointments, EmptyState } from '@/components/ui/empty-state';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  X,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Appointments = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const {
    appointments,
    loading,
    cancelAppointment,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments
  } = useAppointments();

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: 'secondary', label: 'Chờ xác nhận' },
      confirmed: { variant: 'default', label: 'Đã xác nhận' },
      completed: { variant: 'outline', label: 'Hoàn thành' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      site_visit: 'Xem dự án',
      consultation: 'Tư vấn',
      meeting: 'Họp'
    };
    return labels[type] || type;
  };

  const AppointmentCard = ({ appointment, isPast = false }: any) => (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">
                    {getTypeLabel(appointment.appointment_type)}
                  </h3>
                  {getStatusBadge(appointment.status)}
                </div>
                {appointment.project_name && (
                  <p
                    className="text-sm text-primary hover:underline cursor-pointer mt-1"
                    onClick={() => navigate(`/projects/${appointment.project_id}`)}
                  >
                    {appointment.project_name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-14">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(appointment.appointment_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
                <span className="text-muted-foreground">
                  ({appointment.duration_minutes} phút)
                </span>
              </div>

              {appointment.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.contact_phone}</span>
                </div>
              )}

              {appointment.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.contact_email}</span>
                </div>
              )}
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground ml-14">
                {appointment.notes}
              </p>
            )}
          </div>

          {!isPast && appointment.status !== 'cancelled' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelAppointment(appointment.id)}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const content = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch hẹn</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các cuộc hẹn xem dự án và tư vấn
          </p>
        </div>
        <Button onClick={() => navigate('/market-overview')}>
          <Calendar className="h-4 w-4 mr-2" />
          Đặt lịch mới
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="upcoming">
            Sắp tới ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Đã qua ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <NoAppointments onBook={() => navigate('/market-overview')} />
          ) : (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : pastAppointments.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="Không có lịch hẹn nào"
              description="Chưa có lịch hẹn đã qua"
            />
          ) : (
            pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">{content}</div>
        <BottomNavigation />
      </div>
    );
  }

  return <DesktopLayout>{content}</DesktopLayout>;
};

export default Appointments;