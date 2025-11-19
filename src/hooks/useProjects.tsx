import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { projectsData as staticProjects } from '@/data/projectsData';
import { Project } from '@/types/project';
import { toast } from 'sonner';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mergeProjectWithDb = (base: Project, db: any): Project => {
    if (!db) return base;

    return {
      ...base,
      location: db.location || base.location,
      city: db.city || base.city,
      district: db.district || base.district,
      developer: db.developer || base.developer,
      image: db.image || base.image,
      legalScore: db.legal_score ?? base.legalScore,
      status: (db.status as 'good' | 'warning' | 'danger') || base.status,
      priceRange: db.price_range || base.priceRange,
      pricePerSqm: db.price_per_sqm ?? base.pricePerSqm,
      completionDate: db.completion_date || base.completionDate,
      description: db.description || base.description,
      amenities: db.amenities || base.amenities,
      totalUnits: db.total_units ?? base.totalUnits,
      soldUnits: db.sold_units ?? base.soldUnits,
      floors: db.floors ?? base.floors,
      apartmentTypes: db.apartment_types || base.apartmentTypes,
      launchPrice: db.launch_price ?? base.launchPrice,
      launchDate: db.launch_date || base.launchDate,
      currentPrice: db.current_price ?? base.currentPrice,
      // Các trường nâng cao khác (averageRentalPrice, rentalYield, badges, priceHistory...)
      // hiện chưa có trong DB, nên giữ nguyên từ base.
    };
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Luôn bắt đầu từ 300 dự án tĩnh
      let baseProjects = [...staticProjects];

      // Thử lấy dữ liệu từ Supabase để "bồi đắp"
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const dbMap = new Map<string, any>();
        data.forEach((p: any) => {
          if (p.id) {
            dbMap.set(p.id, p);
          }
        });

        const mergedProjects = baseProjects.map((p) => {
          const db = dbMap.get(p.id);
          return mergeProjectWithDb(p, db);
        });

        setProjects(mergedProjects);
      } else {
        // Không có bản ghi trong DB -> dùng nguyên bộ 300 dự án tĩnh
        setProjects(baseProjects);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      toast.error('Không tải được danh sách dự án, đang hiển thị dữ liệu mẫu.');
      // Vẫn luôn fallback về 300 dự án tĩnh
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
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Luôn tìm trước trong danh sách 300 dự án tĩnh
      const baseProject = staticProjects.find((p) => p.id === id) || null;

      try {
        // Thử lấy thêm thông tin từ DB
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          // Nếu DB lỗi (vd: không tìm thấy), vẫn dùng dữ liệu tĩnh nếu có
          console.warn('Supabase project fetch error (sử dụng dữ liệu tĩnh nếu có):', error.message);
          setProject(baseProject);
        } else if (data) {
          // Nếu DB có bản ghi, merge với dữ liệu tĩnh (nếu có), hoặc map thẳng từ DB
          if (baseProject) {
            const merged = {
              ...baseProject,
              location: data.location || baseProject.location,
              city: data.city || baseProject.city,
              district: data.district || baseProject.district,
              developer: data.developer || baseProject.developer,
              image: data.image || baseProject.image,
              legalScore: data.legal_score ?? baseProject.legalScore,
              status: (data.status as 'good' | 'warning' | 'danger') || baseProject.status,
              priceRange: data.price_range || baseProject.priceRange,
              pricePerSqm: data.price_per_sqm ?? baseProject.pricePerSqm,
              completionDate: data.completion_date || baseProject.completionDate,
              description: data.description || baseProject.description,
              amenities: data.amenities || baseProject.amenities,
              totalUnits: data.total_units ?? baseProject.totalUnits,
              soldUnits: data.sold_units ?? baseProject.soldUnits,
              floors: data.floors ?? baseProject.floors,
              apartmentTypes: data.apartment_types || baseProject.apartmentTypes,
              launchPrice: data.launch_price ?? baseProject.launchPrice,
              launchDate: data.launch_date || baseProject.launchDate,
              currentPrice: data.current_price ?? baseProject.currentPrice,
            } as Project;
            setProject(merged);
          } else {
            // Trường hợp hiếm: có trong DB nhưng không có trong danh sách 300 tĩnh
            const mappedProject: Project = {
              id: data.id,
              name: data.name,
              location: data.location,
              city: data.city,
              district: data.district,
              developer: data.developer,
              image: data.image || '/placeholder.svg',
              legalScore: data.legal_score || 0,
              status: (data.status as 'good' | 'warning' | 'danger') || 'warning',
              priceRange: data.price_range || 'Đang cập nhật',
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
          }
        } else {
          // Không có bản ghi trong DB -> dùng dữ liệu tĩnh (nếu có)
          setProject(baseProject);
        }
      } catch (err) {
        console.error('Unexpected error fetching project detail:', err);
        setProject(baseProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading };
};