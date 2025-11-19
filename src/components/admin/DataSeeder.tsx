import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialProjectsSeed } from '@/data/initialProjectsSeed'; // UPDATED IMPORT
import { developersData } from '@/data/developersData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, Upload, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

export const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const log = (message: string) => {
    setResults(prev => [message, ...prev]);
  };

  const clearAllProjects = async () => {
    if (!window.confirm('CẢNH BÁO: Hành động này sẽ xóa TOÀN BỘ dự án trong Database. Bạn có chắc chắn không?')) return;
    
    setLoading(true);
    log('🗑️ Đang xóa dữ liệu...');
    try {
      const { error } = await supabase.from('projects').delete().neq('id', 'placeholder_id_that_does_not_exist');
      if (error) throw error;
      
      toast.success('Đã xóa sạch dữ liệu dự án');
      log('✅ Đã xóa toàn bộ dự án thành công.');
    } catch (error: any) {
      log(`❌ Lỗi khi xóa: ${error.message}`);
      toast.error('Không thể xóa dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const seedDevelopers = async () => {
    setLoading(true);
    log('🚀 Bắt đầu seed Developers...');
    
    try {
      let successCount = 0;
      for (const dev of developersData) {
        const { error } = await supabase.from('developers').upsert({
          id: dev.id,
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
        }, { onConflict: 'name' });

        if (error) {
          log(`❌ Lỗi thêm ${dev.name}: ${error.message}`);
        } else {
          successCount++;
        }
      }
      log(`✅ Hoàn thành! Đã thêm ${successCount}/${developersData.length} chủ đầu tư.`);
      toast.success('Seed Developers hoàn tất');
    } catch (error: any) {
      log(`🔥 Lỗi nghiêm trọng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedProjects = async () => {
    setLoading(true);
    log(`🚀 Bắt đầu seed ${initialProjectsSeed.length} Projects...`);

    try {
      let successCount = 0;
      
      for (const project of initialProjectsSeed) {
        const dbProject = {
          id: project.id,
          name: project.name,
          location: project.location,
          city: project.city,
          district: project.district,
          developer: project.developer,
          image: project.image || '/placeholder.svg',
          legal_score: project.legalScore,
          status: project.status,
          price_range: project.priceRange,
          price_per_sqm: project.pricePerSqm,
          completion_date: project.completionDate,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('projects').upsert(dbProject);

        if (error) {
          log(`❌ Lỗi thêm [${project.name}]: ${error.message}`);
        } else {
          successCount++;
        }
      }

      log(`✅ SEED HOÀN TẤT! Thành công ${successCount}/${initialProjectsSeed.length} dự án.`);
      toast.success(`Đã import ${successCount} dự án vào Database`);
    } catch (error: any) {
      log(`🔥 Lỗi nghiêm trọng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Database className="h-6 w-6" />
          Data Seeder & Migration
        </CardTitle>
        <CardDescription>
          Công cụ quản lý dữ liệu nguồn. Sử dụng cẩn thận trên môi trường Production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Button 
            onClick={clearAllProjects} 
            disabled={loading} 
            variant="destructive"
            className="h-12"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            1. Xóa sạch Dự án cũ
          </Button>

          <Button 
            onClick={seedDevelopers} 
            disabled={loading} 
            variant="outline"
            className="h-12 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Upload className="mr-2 h-4 w-4" />
            2. Seed Chủ đầu tư
          </Button>
          
          <Button 
            onClick={seedProjects} 
            disabled={loading}
            className="h-12 bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            3. Seed {initialProjectsSeed.length} Dự án mới
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <span className="text-sm font-medium text-muted-foreground">Logs hoạt động:</span>
             <Button variant="ghost" size="sm" onClick={() => setResults([])} className="h-6 text-xs">Xóa logs</Button>
          </div>
          <div className="p-4 bg-slate-950 text-green-400 font-mono text-xs rounded-lg h-64 overflow-y-auto shadow-inner">
            {results.length === 0 ? (
              <span className="text-slate-500 italic">// Chờ lệnh thực thi...</span>
            ) : (
              results.map((log, i) => (
                <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{log}</div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Quy trình khuyến nghị:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Bấm <strong>"Xóa sạch Dự án cũ"</strong> để tránh trùng lặp ID hoặc dữ liệu rác.</li>
              <li>Bấm <strong>"Seed Chủ đầu tư"</strong> để đảm bảo có dữ liệu liên kết.</li>
              <li>Bấm <strong>"Seed Dự án mới"</strong> để nạp danh sách 300 dự án vào hệ thống.</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};