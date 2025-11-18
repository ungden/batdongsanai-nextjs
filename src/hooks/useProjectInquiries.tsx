import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agent {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  years_experience: number | null;
  specialization: string[] | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
}

export interface ProjectAgent extends Agent {
  role: string;
  priority: number;
  leads_received: number;
  leads_converted: number;
}

export interface InquiryFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  inquiry_type: 'general' | 'viewing' | 'pricing' | 'purchase';
  message?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_bedrooms?: number;
  preferred_area_sqm?: number;
  preferred_floor_range?: string;
  move_in_timeline?: string;
  how_did_you_hear?: string;
  preferred_contact_time?: string;
}

export interface ProjectInquiry {
  id: string;
  project_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  inquiry_type: string;
  message: string | null;
  status: string;
  created_at: string;
  assigned_agent_id: string | null;
}

export const useProjectInquiries = () => {
  const [submitting, setSubmitting] = useState(false);

  const submitInquiry = async (
    projectId: string,
    formData: InquiryFormData
  ): Promise<{ success: boolean; inquiryId?: string }> => {
    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      // Get UTM parameters from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || undefined;
      const utmMedium = urlParams.get('utm_medium') || undefined;
      const utmCampaign = urlParams.get('utm_campaign') || undefined;

      // Insert inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('project_inquiries' as any)
        .insert({
          project_id: projectId,
          user_id: user?.id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          inquiry_type: formData.inquiry_type,
          message: formData.message || null,
          budget_min: formData.budget_min || null,
          budget_max: formData.budget_max || null,
          preferred_bedrooms: formData.preferred_bedrooms || null,
          preferred_area_sqm: formData.preferred_area_sqm || null,
          preferred_floor_range: formData.preferred_floor_range || null,
          move_in_timeline: formData.move_in_timeline || null,
          how_did_you_hear: formData.how_did_you_hear || null,
          preferred_contact_time: formData.preferred_contact_time || null,
          source: 'web',
          referrer_url: document.referrer || null,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          status: 'new',
        })
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      const inquiryData = (inquiry as any) as ProjectInquiry;

      // Auto-assign to agent
      try {
        await supabase.rpc('assign_inquiry_to_agent' as any, {
          inquiry_uuid: inquiryData.id,
        });
      } catch (assignError) {
        console.error('Error auto-assigning inquiry:', assignError);
        // Don't fail the whole inquiry if assignment fails
      }

      toast.success('Đã gửi thông tin thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.');
      return { success: true, inquiryId: inquiryData.id };
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitInquiry,
    submitting,
  };
};

export const useProjectAgents = (projectId: string) => {
  const [agents, setAgents] = useState<ProjectAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('project_agents' as any)
        .select(`
          role,
          priority,
          leads_received,
          leads_converted,
          agents:agent_id (
            id,
            full_name,
            company_name,
            phone,
            email,
            bio,
            avatar_url,
            years_experience,
            specialization,
            rating,
            total_reviews,
            is_verified
          )
        `)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;

      // Flatten the nested structure
      const formattedAgents = (data || [])
        .filter((item: any) => item.agents) // Filter out null agents
        .map((item: any) => ({
          ...(item.agents as any),
          role: item.role,
          priority: item.priority,
          leads_received: item.leads_received,
          leads_converted: item.leads_converted,
        }));

      setAgents(formattedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Không thể tải danh sách tư vấn viên');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useState(() => {
    if (projectId) {
      fetchAgents();
    }
  });

  return {
    agents,
    loading,
    refreshAgents: fetchAgents,
  };
};

export const useMyInquiries = () => {
  const [inquiries, setInquiries] = useState<ProjectInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyInquiries = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInquiries([]);
        return;
      }

      const { data, error } = await supabase
        .from('project_inquiries' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInquiries(((data as any) as ProjectInquiry[]) || []);
    } catch (error) {
      console.error('Error fetching my inquiries:', error);
      toast.error('Không thể tải danh sách yêu cầu tư vấn');
    } finally {
      setLoading(false);
    }
  };

  return {
    inquiries,
    loading,
    refreshInquiries: fetchMyInquiries,
  };
};