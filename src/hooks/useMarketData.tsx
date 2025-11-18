import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// PRICING ANALYTICS
// ============================================

export interface PricingHistory {
  id: string;
  project_id: string;
  price_date: string;
  price_type: 'launch' | 'current' | 'transaction' | 'forecast';
  price_per_sqm: number;
  unit_type?: string;
  floor_range?: string;
  source?: string;
  confidence_score?: number;
  notes?: string;
  created_at: string;
}

export const usePricingHistory = (projectId: string) => {
  const [data, setData] = useState<PricingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: history, error } = await supabase
          .from('project_pricing_history')
          .select('*')
          .eq('project_id', projectId)
          .order('price_date', { ascending: true });

        if (error) throw error;
        setData(history || []);
      } catch (error) {
        console.error('Error fetching pricing history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId]);

  return { pricingHistory: data, loading };
};

// ============================================
// MARKET CATALYSTS
// ============================================

export interface MarketCatalyst {
  id: string;
  catalyst_type: 'infrastructure' | 'policy' | 'economic' | 'supply_demand' | 'developer_reputation';
  title: string;
  description: string;
  impact_level: 'very_high' | 'high' | 'medium' | 'low';
  impact_direction: 'positive' | 'negative' | 'neutral';
  affected_areas?: string[];
  affected_project_ids?: string[];
  announcement_date?: string;
  effective_date?: string;
  completion_date?: string;
  estimated_price_impact_percent?: number;
  source_url?: string;
  verification_status: 'verified' | 'pending' | 'disputed';
  created_at: string;
}

export const useMarketCatalysts = (filters?: {
  projectId?: string;
  area?: string;
  type?: string;
  impactLevel?: string;
}) => {
  const [catalysts, setCatalysts] = useState<MarketCatalyst[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalysts = async () => {
      try {
        let query = supabase
          .from('market_catalysts')
          .select('*')
          .order('effective_date', { ascending: false });

        if (filters?.type) {
          query = query.eq('catalyst_type', filters.type);
        }

        if (filters?.impactLevel) {
          query = query.eq('impact_level', filters.impactLevel);
        }

        if (filters?.projectId) {
          query = query.contains('affected_project_ids', [filters.projectId]);
        }

        if (filters?.area) {
          query = query.contains('affected_areas', [filters.area]);
        }

        const { data, error } = await query;

        if (error) throw error;
        setCatalysts(data || []);
      } catch (error) {
        console.error('Error fetching catalysts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalysts();
  }, [filters?.projectId, filters?.area, filters?.type, filters?.impactLevel]);

  return { catalysts, loading };
};

// ============================================
// RENTAL MARKET DATA
// ============================================

export interface RentalMarketData {
  id: string;
  project_id: string;
  data_date: string;
  unit_type: string;
  rental_price_min?: number;
  rental_price_max?: number;
  rental_price_avg?: number;
  occupancy_rate?: number;
  average_lease_term_months?: number;
  tenant_profile?: string;
  seasonal_demand?: string;
  yield_percentage?: number;
  source?: string;
  created_at: string;
}

export const useRentalData = (projectId: string) => {
  const [rentalData, setRentalData] = useState<RentalMarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('rental_market_data')
          .select('*')
          .eq('project_id', projectId)
          .order('data_date', { ascending: false });

        if (error) throw error;
        setRentalData(data || []);
      } catch (error) {
        console.error('Error fetching rental data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchData();
  }, [projectId]);

  // Calculate average rental yield
  const avgRentalYield =
    rentalData.length > 0
      ? rentalData.reduce((sum, d) => sum + (d.yield_percentage || 0), 0) / rentalData.length
      : 0;

  return { rentalData, avgRentalYield, loading };
};

// ============================================
// PAYMENT POLICIES
// ============================================

export interface PaymentPolicy {
  id: string;
  project_id: string;
  policy_name: string;
  policy_type: 'installment' | 'bank_loan' | 'developer_financing' | 'promotion';
  description?: string;
  down_payment_percent?: number;
  installment_periods?: number;
  interest_rate?: number;
  bank_partner?: string;
  promotion_details?: any;
  eligible_unit_types?: string[];
  start_date?: string;
  end_date?: string;
  terms_conditions?: string;
  is_active: boolean;
  created_at: string;
}

export const usePaymentPolicies = (projectId: string) => {
  const [policies, setPolicies] = useState<PaymentPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_policies')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPolicies(data || []);
      } catch (error) {
        console.error('Error fetching payment policies:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchPolicies();
  }, [projectId]);

  return { paymentPolicies: policies, loading };
};

// ============================================
// INFRASTRUCTURE DEVELOPMENTS
// ============================================

export interface InfrastructureDevelopment {
  id: string;
  infrastructure_type: string;
  name: string;
  description?: string;
  location_district?: string;
  status: 'planned' | 'under_construction' | 'completed' | 'cancelled';
  start_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  budget_vnd?: number;
  distance_impact_radius_km?: number;
  estimated_property_impact_percent?: number;
  affected_project_ids?: string[];
  source_url?: string;
  images?: string[];
  created_at: string;
}

export const useInfrastructure = (filters?: {
  projectId?: string;
  district?: string;
  type?: string;
  status?: string;
}) => {
  const [infrastructure, setInfrastructure] = useState<InfrastructureDevelopment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase
          .from('infrastructure_developments')
          .select('*')
          .order('expected_completion', { ascending: true });

        if (filters?.type) {
          query = query.eq('infrastructure_type', filters.type);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        if (filters?.district) {
          query = query.eq('location_district', filters.district);
        }

        if (filters?.projectId) {
          query = query.contains('affected_project_ids', [filters.projectId]);
        }

        const { data, error } = await query;

        if (error) throw error;
        setInfrastructure(data || []);
      } catch (error) {
        console.error('Error fetching infrastructure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.projectId, filters?.district, filters?.type, filters?.status]);

  return { infrastructure, loading };
};

// ============================================
// COMPARABLE SALES
// ============================================

export interface ComparableSale {
  id: string;
  project_id: string;
  transaction_date: string;
  unit_type?: string;
  floor_number?: number;
  area_sqm?: number;
  total_price: number;
  price_per_sqm: number;
  direction?: string;
  view_type?: string;
  condition?: string;
  furniture_status?: string;
  transaction_type?: string;
  buyer_type?: string;
  financing_method?: string;
  verification_status: string;
  source?: string;
  notes?: string;
  created_at: string;
}

export const useComparableSales = (projectId: string, limit: number = 20) => {
  const [sales, setSales] = useState<ComparableSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data, error } = await supabase
          .from('comparable_sales')
          .select('*')
          .eq('project_id', projectId)
          .order('transaction_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setSales(data || []);
      } catch (error) {
        console.error('Error fetching comparable sales:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchSales();
  }, [projectId, limit]);

  // Calculate average transaction price
  const avgTransactionPrice =
    sales.length > 0
      ? sales.reduce((sum, s) => sum + s.price_per_sqm, 0) / sales.length
      : 0;

  return { comparableSales: sales, avgTransactionPrice, loading };
};

// ============================================
// MARKET REGULATIONS
// ============================================

export interface MarketRegulation {
  id: string;
  regulation_type: string;
  title: string;
  description: string;
  issuing_authority?: string;
  regulation_number?: string;
  effective_date: string;
  expiry_date?: string;
  affected_areas?: string[];
  impact_on_buyers?: string;
  impact_on_investors?: string;
  impact_on_market?: string;
  document_url?: string;
  created_at: string;
}

export const useMarketRegulations = (filters?: {
  type?: string;
  area?: string;
}) => {
  const [regulations, setRegulations] = useState<MarketRegulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        let query = supabase
          .from('market_regulations')
          .select('*')
          .order('effective_date', { ascending: false });

        if (filters?.type) {
          query = query.eq('regulation_type', filters.type);
        }

        if (filters?.area) {
          query = query.contains('affected_areas', [filters.area]);
        }

        const { data, error } = await query;

        if (error) throw error;
        setRegulations(data || []);
      } catch (error) {
        console.error('Error fetching regulations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegulations();
  }, [filters?.type, filters?.area]);

  return { regulations, loading };
};
