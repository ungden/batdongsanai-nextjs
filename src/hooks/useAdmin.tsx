"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from './usePermissions';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_by: string | null;
  assigned_at: string;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

interface ConsultationRequest {
  id: string;
  project_id: string;
  project_name: string;
  full_name: string;
  phone: string;
  email: string;
  occupation: string | null;
  budget_range: string | null;
  preferred_contact_time: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useAdmin = () => {
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const [dataLoading, setDataLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }
    if (user && isAdmin) {
      setDataLoading(true);
      Promise.all([
        fetchUserRoles(),
        fetchAdminLogs(),
        fetchSystemSettings(),
        fetchConsultationRequests(),
        fetchProjects(),
        fetchDevelopers()
      ]).finally(() => setDataLoading(false));
    } else {
      setDataLoading(false);
      setUserRoles([]);
      setAdminLogs([]);
      setSystemSettings([]);
      setConsultationRequests([]);
      setProjects([]);
      setDevelopers([]);
    }
  }, [user, isAdmin, permissionsLoading]);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAdminLogs(data || []);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSystemSettings(data || []);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  const fetchConsultationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultationRequests((data as any) || []);
    } catch (error) {
      console.error('Error fetching consultation requests:', error);
    }
  };

  const logAdminAction = async (action: string, targetTable?: string, targetId?: string, oldData?: any, newData?: any) => {
    if (!user || !isAdmin) return;

    try {
      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action,
        target_table: targetTable || null,
        target_id: targetId || null,
        old_data: oldData || null,
        new_data: newData || null,
        ip_address: null, // Could be implemented with additional detection
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          assigned_by: user?.id
        });

      if (error) throw error;

      await logAdminAction('UPDATE_USER_ROLE', 'user_roles', userId, null, { role });
      await fetchUserRoles();
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật vai trò người dùng",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật vai trò",
        variant: "destructive"
      });
    }
  };

  const updateSystemSetting = async (key: string, value: any, description?: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          description: description || null,
          updated_by: user?.id
        });

      if (error) throw error;

      await logAdminAction('UPDATE_SYSTEM_SETTING', 'system_settings', key, null, { key, value });
      await fetchSystemSettings();
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật cài đặt hệ thống",
      });
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật cài đặt",
        variant: "destructive"
      });
    }
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await logAdminAction('UPDATE_CONSULTATION_STATUS', 'consultation_requests', id, null, { status });
      await fetchConsultationRequests();
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái yêu cầu tư vấn",
      });
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật trạng thái",
        variant: "destructive"
      });
    }
  };

  const deleteConsultationRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAdminAction('DELETE_CONSULTATION_REQUEST', 'consultation_requests', id);
      await fetchConsultationRequests();
      
      toast({
        title: "Thành công",
        description: "Đã xóa yêu cầu tư vấn",
      });
    } catch (error) {
      console.error('Error deleting consultation request:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa yêu cầu",
        variant: "destructive"
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDevelopers(data || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  };

  return {
    isAdmin,
    loading: permissionsLoading || dataLoading,
    userRoles,
    adminLogs,
    systemSettings,
    consultationRequests,
    projects,
    developers,
    updateUserRole,
    updateSystemSetting,
    updateConsultationStatus,
    deleteConsultationRequest,
    refetch: {
      userRoles: fetchUserRoles,
      adminLogs: fetchAdminLogs,
      systemSettings: fetchSystemSettings,
      consultationRequests: fetchConsultationRequests,
      projects: fetchProjects,
      developers: fetchDevelopers
    }
  };
};