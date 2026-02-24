"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useProjectViews = () => {
  const { user } = useAuth();

  const trackView = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('project_views')
        .insert({
          project_id: projectId,
          user_id: user?.id || null,
          ip_address: null, // We can't get IP on client side
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });

      if (error) {
        console.error('Error tracking view:', error);
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return { trackView };
};
