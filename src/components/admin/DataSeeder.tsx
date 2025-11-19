import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { projectsData } from '@/data/projectsData';
import { developersData } from '@/data/developersData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

export const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const seedDevelopers = async () => {
    setLoading(true);
    const logs: string[] = [];
    
    try {
      logs.push('Bắt đầu seed Developers...');
      
      for (const dev of developersData) {
        const { error } = await supabase.from('developers').upsert({
          id: dev.id, // Assuming ID matches or let Supabase generate if not present
          name: dev.name,
          logo: dev.logo,
          description: dev.description,
          established_year: dev.establishedYear,
          website: dev.website,
          hotline: dev.hotline,
          email: dev.email,
          address: dev.address,
          total_projects: dev.totalProjects,
          completed_projects: dev.completedProjects,
          avg_legal_score: dev.avgLegalScore,
          avg_rating: dev.avgRating,
          specialties: dev.specialties
        }, { onConflict: 'name' }); // Upsert based on name to avoid duplicates

        if (error) {
          logs.push(`❌ Lỗi thêm ${dev.name}: ${error.message}`);
        } else {
          logs.push(`✅ Đã thêm/cập nhật: ${dev.name}`);
        }
      }
      
      toast.success('Hoàn thành seed Developers');
    } catch (error: any) {
      logs.push(`🔥 Lỗi nghiêm trọng: ${error.message}`);
      toast.error('Có lỗi xảy ra');
    } finally {
      setResults(prev => [...prev, ...logs]);
      setLoading(false);
    }
  };

  const seedProjects = async () => {
    setLoading(true);
    const logs: string[] = [];

    try {
      logs.push('Bắt đầu seed Projects...');

      for (const project of projectsData) {
        // Map static data to DB schema
        const dbProject = {
          id: project.id, // Keep ID if UUID, otherwise might need generation
          name: project.name,
          location: project.location,
          city: project.city,
          district: project.district,
          developer: project.developer,
          image: project.image,
          legal_score: project.legalScore,
          status: project.status,
          price_range: project.priceRange,
          price_per_sqm: project.pricePerSqm,
          completion_date: project.completionDate,
          description: project.description,
          amenities: project.amenities,
          total_units: project.totalUnits,
          sold_units: project.soldUnits,
          floors: project.floors,
          apartment_types: project.apartmentTypes,
          launch_price: project.launchPrice,
          launch_date: project.launchDate,
          current_price: project.currentPrice,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('projects').upsert(dbProject);

        if (error) {
          logs.push(`❌ Lỗi thêm dự án ${project.name}: ${error.message}`);
        } else {
          logs.push(`✅ Đã thêm/cập nhật dự án: ${project.name}`);
          
          // Seed Price History if available
          if (project.priceHistory && project.priceHistory.length > 0) {
             const historyRecords = project.priceHistory.map(h => ({
               project_id: project.id,
               price_date: h.date + '-01', // Convert YYYY-MM to YYYY-MM-DD
               price_type: 'history',
               price_per_sqm: h.price,
               source: 'system_migration'
             }));
             
             const { error: histError } = await supabase.from('project_pricing_history' as any).insert(historyRecords);
             if (histError) logs.push(`   ⚠️ Lỗi thêm lịch sử giá: ${histError.message}`);
             else logs.push(`   + Đã thêm ${historyRecords.length} bản ghi giá`);
          }
        }
      }

      toast.success('Hoàn thành seed Projects');
    } catch (error: any) {
      logs.push(`🔥 Lỗi nghiêm trọng: ${error.message}`);
      toast.error('Có lỗi xảy ra');
    } finally {
      setResults(prev => [...prev, ...logs]);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration Tool
        </CardTitle>
        <CardDescription>
          Công cụ chuyển đổi dữ liệu tĩnh sang Database. Chỉ sử dụng khi khởi tạo hệ thống.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={seedDevelopers} disabled={loading} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Seed Developers
          </Button>
          <Button onClick={seedProjects} disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            Seed Projects
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 p-4 bg-slate-950 text-green-400 font-mono text-xs rounded-lg h-64 overflow-y-auto">
            {results.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Hành động này sẽ ghi đè dữ liệu hiện có nếu trùng ID hoặc Tên. 
            Hãy đảm bảo backup dữ liệu trước khi chạy.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};