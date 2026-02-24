"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';
import { toast } from 'sonner';

// Helper function to map snake_case from DB to camelCase in the app
const mapDbToProject = (dbProject: any): Project => {
  return {
    id: dbProject.id,
    name: dbProject.name,
    location: dbProject.location,
    city: dbProject.city,
    district: dbProject.district,
    developer: dbProject.developer,
    image: dbProject.image || '/placeholder.svg',
    legalScore: dbProject.legal_score || 0,
    status: (dbProject.status as 'good' | 'warning' | 'danger') || 'warning',
    priceRange: dbProject.price_range || 'Đang cập nhật',
    pricePerSqm: dbProject.price_per_sqm || 0,
    completionDate: dbProject.completion_date || 'Đang cập nhật',
    warnings: dbProject.warnings || [], // Assuming warnings column exists
    description: dbProject.description,
    amenities: dbProject.amenities || [],
    totalUnits: dbProject.total_units,
    soldUnits: dbProject.sold_units,
    floors: dbProject.floors,
    apartmentTypes: dbProject.apartment_types || [],
    launchPrice: dbProject.launch_price,
    launchDate: dbProject.launch_date,
    currentPrice: dbProject.current_price,
    // Các trường nâng cao khác sẽ được thêm vào khi DB có
  };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const mappedProjects = data.map(mapDbToProject);
      setProjects(mappedProjects);
    } catch (err: any) {
      console.error('Error fetching projects from Supabase:', err);
      setError(err.message);
      toast.error('Không thể tải danh sách dự án từ cơ sở dữ liệu.');
      setProjects([]); // Return empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
};

export const useProjectDetail = (id: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setProject(null);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // "Not a single row"
          console.warn(`Project with id=${id} not found in DB.`);
          setProject(null);
        } else {
          throw error;
        }
      } else if (data) {
        setProject(mapDbToProject(data));
      } else {
        setProject(null);
      }
    } catch (err: any) {
      console.error(`Error fetching project detail (id=${id}):`, err);
      toast.error('Không thể tải thông tin chi tiết dự án.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, refetch: fetchProject };
};