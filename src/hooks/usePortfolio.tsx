import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PortfolioItem {
  id: string;
  user_id: string;
  project_id: string;
  project_name: string;
  purchase_price: number;
  purchase_date: string;
  quantity: number;
  notes?: string;
  current_value?: number;
  roi_percentage?: number;
  created_at: string;
  updated_at: string;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [totalROI, setTotalROI] = useState(0);

  const calculateStats = (items: PortfolioItem[]) => {
    const investment = items.reduce((sum, item) => sum + item.purchase_price * item.quantity, 0);
    const value = items.reduce((sum, item) => sum + (item.current_value || item.purchase_price) * item.quantity, 0);
    const roi = investment > 0 ? ((value - investment) / investment) * 100 : 0;

    setTotalInvestment(investment);
    setTotalValue(value);
    setTotalROI(roi);
  };

  const fetchPortfolio = async () => {
    if (!user) {
      setPortfolio([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_portfolios' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      const items = ((data as any) as PortfolioItem[]) || [];
      setPortfolio(items);
      calculateStats(items);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async (item: Omit<PortfolioItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_portfolios' as any)
        .insert({
          user_id: user.id,
          ...item
        })
        .select()
        .single();

      if (error) throw error;

      const newItem = (data as any) as PortfolioItem;
      const updatedPortfolio = [newItem, ...portfolio];
      setPortfolio(updatedPortfolio);
      calculateStats(updatedPortfolio);
      toast.success('Đã thêm vào danh mục đầu tư');
      return newItem;
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      toast.error('Không thể thêm vào danh mục');
      throw error;
    }
  };

  const updatePortfolioItem = async (id: string, updates: Partial<PortfolioItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_portfolios' as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedItem = (data as any) as PortfolioItem;
      const updatedPortfolio = portfolio.map(item => item.id === id ? updatedItem : item);
      setPortfolio(updatedPortfolio);
      calculateStats(updatedPortfolio);
      toast.success('Đã cập nhật');
      return updatedItem;
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      toast.error('Không thể cập nhật');
      throw error;
    }
  };

  const removeFromPortfolio = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_portfolios' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const updatedPortfolio = portfolio.filter(item => item.id !== id);
      setPortfolio(updatedPortfolio);
      calculateStats(updatedPortfolio);
      toast.success('Đã xóa khỏi danh mục');
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      toast.error('Không thể xóa');
      throw error;
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  return {
    portfolio,
    loading,
    totalValue,
    totalInvestment,
    totalROI,
    addToPortfolio,
    updatePortfolioItem,
    removeFromPortfolio,
    refresh: fetchPortfolio
  };
};