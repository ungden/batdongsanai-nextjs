import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { projectsData as staticProjects } from '@/data/projectsData';
import { Project } from '@/types/project';
import { toast } from 'sonner';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch projects from Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map DB structure to Project type if necessary
        // Assuming the DB structure matches closely or we map it here
        const mappedProjects: Project[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          location: p.location,
          city: p.city,
          district: p.district,
          developer: p.developer,
          image: p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
          legalScore: p.legal_score || 0,
          status: (p.status as "good" | "warning" | "danger") || 'warning',
          priceRange: p.price_range || 'Liên hệ',
          pricePerSqm: p.price_per_sqm || 0,
          completionDate: p.completion_date || 'Đang cập nhật',
          warnings: [], // You might want to fetch warnings from a related table
          description: p.description,
          amenities: p.amenities || [],
          totalUnits: p.total_units,
          soldUnits: p.sold_units,
          floors: p.floors,
          apartmentTypes: p.apartment_types || [],
          launchPrice: p.launch_price,
          launchDate: p.launch_date,
          currentPrice: p.current_price,
          // Add other fields as needed
        }));
        setProjects(mappedProjects);
      } else {
        // Fallback to static data if DB is empty (for demo purposes)
        console.log('Using static data fallback');
        setProjects(staticProjects);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      // Fallback on error
      setProjects(staticProjects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: fetchProjects };
};

export const useProjectDetail = (id: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // Try fetching from DB first
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
           const mappedProject: Project = {
            id: data.id,
            name: data.name,
            location: data.location,
            city: data.city,
            district: data.district,
            developer: data.developer,
            image: data.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
            legalScore: data.legal_score || 0,
            status: (data.status as "good" | "warning" | "danger") || 'warning',
            priceRange: data.price_range || 'Liên hệ',
            pricePerSqm: data.price_per_sqm || 0,
            completionDate: data.completion_date || 'Đang cập nhật',
            warnings: [], 
            description: data.description,
            amenities: data.amenities || [],
            totalUnits: data.total_units,
            soldUnits: data.sold_units,
            floors: data.floors,
            apartmentTypes: data.apartment_types || [],
            launchPrice: data.launch_price,
            launchDate: data.launch_date,
            currentPrice: data.current_price,
          };
          setProject(mappedProject);
        } else {
          // Fallback to static data
          const staticProject = staticProjects.find(p => p.id === id);
          setProject(staticProject || null);
        }
      } catch (err) {
        console.error(err);
        const staticProject = staticProjects.find(p => p.id === id);
        setProject(staticProject || null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading };
};