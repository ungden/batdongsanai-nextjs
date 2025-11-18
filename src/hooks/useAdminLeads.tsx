import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadInquiry {
  id: string;
  project_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  inquiry_type: string;
  message: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_bedrooms: number | null;
  move_in_timeline: string | null;
  status: string;
  lead_score: number;
  lead_quality: 'hot' | 'warm' | 'cold' | 'unqualified';
  ai_summary: string | null;
  ai_recommendations: string[] | null;
  admin_notes: string | null;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  unqualified_leads: number;
  avg_score: number;
  assigned_leads: number;
  unassigned_leads: number;
  conversion_rate: number;
}

export interface LeadFilters {
  quality?: string;
  status?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  assigned?: 'assigned' | 'unassigned' | 'all';
}

export const useAdminLeads = (filters: LeadFilters = {}) => {
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('project_inquiries' as any)
        .select('*', { count: 'exact' })
        .order('lead_score', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.quality && filters.quality !== 'all') {
        query = query.eq('lead_quality', filters.quality);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.assigned === 'assigned') {
        query = query.not('assigned_agent_id', 'is', null);
      } else if (filters.assigned === 'unassigned') {
        query = query.is('assigned_agent_id', null);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setLeads(((data as any) as LeadInquiry[]) || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Không thể tải danh sách leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [JSON.stringify(filters)]);

  const assignLead = async (inquiryId: string, agentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập');
        return false;
      }

      const { error } = await supabase.rpc('admin_assign_inquiry' as any, {
        inquiry_uuid: inquiryId,
        agent_uuid: agentId,
        admin_uuid: user.id,
      });

      if (error) throw error;

      toast.success('Đã assign lead thành công');
      fetchLeads(); // Refresh
      return true;
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Có lỗi xảy ra khi assign lead');
      return false;
    }
  };

  const updateLeadNotes = async (inquiryId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('project_inquiries' as any)
        .update({
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiryId);

      if (error) throw error;

      toast.success('Đã cập nhật ghi chú');
      fetchLeads();
      return true;
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Có lỗi xảy ra');
      return false;
    }
  };

  const updateLeadStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('project_inquiries' as any)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiryId);

      if (error) throw error;

      toast.success('Đã cập nhật trạng thái');
      fetchLeads();
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra');
      return false;
    }
  };

  const exportLeads = () => {
    // Convert to CSV
    const headers = [
      'ID',
      'Tên KH',
      'SĐT',
      'Email',
      'Dự án',
      'Loại yêu cầu',
      'Điểm',
      'Chất lượng',
      'Trạng thái',
      'Ngân sách Min',
      'Ngân sách Max',
      'Phòng ngủ',
      'Timeline',
      'AI Summary',
      'Ngày tạo',
    ];

    const rows = leads.map(lead => [
      lead.id,
      lead.customer_name,
      lead.customer_phone,
      lead.customer_email || '',
      lead.project_id,
      lead.inquiry_type,
      lead.lead_score,
      lead.lead_quality,
      lead.status,
      lead.budget_min || '',
      lead.budget_max || '',
      lead.preferred_bedrooms || '',
      lead.move_in_timeline || '',
      lead.ai_summary || '',
      new Date(lead.created_at).toLocaleDateString('vi-VN'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã export leads');
  };

  return {
    leads,
    loading,
    totalCount,
    assignLead,
    updateLeadNotes,
    updateLeadStatus,
    exportLeads,
    refreshLeads: fetchLeads,
  };
};

export const useLeadStats = (dateRange: { from?: string; to?: string } = {}) => {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_lead_statistics' as any, {
        start_date: dateRange.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: dateRange.to || new Date().toISOString(),
      });

      if (error) throw error;

      if (data && (data as any).length > 0) {
        const statData = (data as any)[0];
        setStats({
          total_leads: Number(statData.total_leads),
          hot_leads: Number(statData.hot_leads),
          warm_leads: Number(statData.warm_leads),
          cold_leads: Number(statData.cold_leads),
          unqualified_leads: Number(statData.unqualified_leads),
          avg_score: Number(statData.avg_score),
          assigned_leads: Number(statData.assigned_leads),
          unassigned_leads: Number(statData.unassigned_leads),
          conversion_rate: Number(statData.conversion_rate),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange.from, dateRange.to]);

  return {
    stats,
    loading,
    refreshStats: fetchStats,
  };
};