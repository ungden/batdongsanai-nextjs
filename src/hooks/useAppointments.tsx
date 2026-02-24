"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  user_id: string;
  project_id?: string;
  project_name?: string;
  appointment_type: 'site_visit' | 'consultation' | 'meeting';
  appointment_date: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  contact_phone?: string;
  contact_email?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(((data as any) as Appointment[]) || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'user_id' | 'reminder_sent' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt lịch');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .insert({
          user_id: user.id,
          ...appointment,
          contact_email: appointment.contact_email || user.email,
        })
        .select()
        .single();

      if (error) throw error;

      const newAppointment = (data as any) as Appointment;
      setAppointments(prev => [...prev, newAppointment].sort((a, b) =>
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      ));
      toast.success('Đã đặt lịch hẹn thành công');
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Không thể đặt lịch hẹn');
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedAppointment = (data as any) as Appointment;
      setAppointments(prev =>
        prev.map(a => a.id === id ? updatedAppointment : a)
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      );
      toast.success('Đã cập nhật lịch hẹn');
      return updatedAppointment;
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Không thể cập nhật');
      throw error;
    }
  };

  const cancelAppointment = async (id: string) => {
    return updateAppointment(id, { status: 'cancelled' });
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('appointments' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.success('Đã xóa lịch hẹn');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Không thể xóa');
      throw error;
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(a =>
      new Date(a.appointment_date) > now && a.status !== 'cancelled' && a.status !== 'completed'
    );
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(a =>
      new Date(a.appointment_date) <= now || a.status === 'completed'
    );
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    refresh: fetchAppointments
  };
};