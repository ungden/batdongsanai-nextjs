"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects"; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, CheckCircle2, Circle, Sparkles, Database, Loader2 } from "lucide-react";

export default function ProjectEnrichment() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { projects, loading } = useProjects(); // Use Hook

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.developer.toLowerCase().includes(search.toLowerCase())
  );

  // Giả lập trạng thái dữ liệu (Trong thực tế sẽ query từ DB đếm số record liên quan)
  const getDataStatus = (project: any) => {
    // Mock logic
    const hasAnalysis = project.legalScore > 0; 
    const hasCatalyst = project.pricePerSqm > 0;
    const hasContent = (project.amenities?.length || 0) > 0;
    
    const progress = [hasAnalysis, hasCatalyst, hasContent].filter(Boolean).length;
    const total = 3;
    
    return { hasAnalysis, hasCatalyst, hasContent, progress, total };
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quy trình làm giàu dữ liệu</h1>
        <p className="text-muted-foreground">Pipeline: Nhập thô → Phân tích AI → Kết nối thị trường → Tạo nội dung</p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-10">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Tìm dự án để xử lý..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid gap-4">
        {filteredProjects.map(project => {
          const status = getDataStatus(project);
          const percent = Math.round((status.progress / status.total) * 100);
          
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
                    <Badge variant="outline">{project.district}</Badge>
                    {percent === 100 && <Badge className="bg-green-500">Hoàn tất</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {status.hasAnalysis ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                      <span>Phân tích sâu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.hasCatalyst ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                      <span>Dữ liệu thị trường</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.hasContent ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                      <span>Bài viết Content</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-2xl font-bold text-primary">{percent}%</div>
                    <div className="text-xs text-muted-foreground">Hoàn thành</div>
                  </div>
                  <Button onClick={() => navigate(`/admin/enrichment/${project.id}`)}>
                    Xử lý ngay <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}