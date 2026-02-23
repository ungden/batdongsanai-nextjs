"use client";
import { useMemo } from "react";
import { useRouter } from 'next/navigation';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, ArrowRight, Search, Database, Map, 
  PenTool, CheckCircle, MoreHorizontal, Loader2 
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";

// Định nghĩa các cột trạng thái (Stages) sử dụng semantic utility classes
const STAGES = [
  { id: 'new', title: '1. Mới / Sơ khai', icon: Search, color: 'bg-subtle-slate' },
  { id: 'enriching', title: '2. Đang làm giàu data', icon: Database, color: 'bg-subtle-blue' },
  { id: 'analyzing', title: '3. Phân tích thị trường', icon: Map, color: 'bg-subtle-amber' },
  { id: 'content', title: '4. Soạn nội dung', icon: PenTool, color: 'bg-subtle-purple' },
  { id: 'ready', title: '5. Sẵn sàng / Đã duyệt', icon: CheckCircle, color: 'bg-subtle-green' },
];

export default function ProjectPipeline() {
  const navigate = useRouter();
  const { projects, loading } = useProjects();

  // Logic phân loại dự án vào các cột
  const pipelineData = useMemo(() => {
    const columns: Record<string, Project[]> = {
      new: [],
      enriching: [],
      analyzing: [],
      content: [],
      ready: []
    };

    projects.forEach(p => {
      if (p.status === 'good' && p.description && p.description.length > 50 && p.priceHistory?.length) {
        columns.ready.push(p);
      } else if (p.description && p.description.length > 50 && p.amenities && p.amenities.length > 0) {
        columns.content.push(p);
      } else if (p.pricePerSqm > 0 && p.legalScore > 0) {
        columns.analyzing.push(p);
      } else if (p.location && p.location !== 'Đang cập nhật' && p.developer !== 'Đang cập nhật') {
        columns.enriching.push(p);
      } else {
        columns.new.push(p);
      }
    });

    return columns;
  }, [projects]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 text-foreground">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold">Quy trình dữ liệu (Pipeline)</h1>
          <p className="text-muted-foreground text-sm">Quản lý vòng đời dữ liệu dự án từ lúc tìm kiếm đến khi xuất bản</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate.push("/admin/ai-scout")}>
            <Search className="mr-2 h-4 w-4" /> AI Scout (Tìm mới)
          </Button>
          <Button onClick={() => navigate.push("/admin/projects")}>
            <Plus className="mr-2 h-4 w-4" /> Tạo thủ công
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]">
          {STAGES.map(stage => (
            <div key={stage.id} className={`flex-1 flex flex-col min-w-[280px] rounded-xl border transition-colors ${stage.color}`}>
              {/* Column Header */}
              <div className="p-3 border-b border-border/50 flex items-center justify-between bg-background/50 rounded-t-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                  <stage.icon className="w-4 h-4 opacity-70" />
                  {stage.title}
                </div>
                <Badge variant="secondary" className="bg-background text-foreground hover:bg-background border-border">
                  {pipelineData[stage.id]?.length || 0}
                </Badge>
              </div>

              {/* Cards Area */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {pipelineData[stage.id]?.map(project => (
                    <Card 
                      key={project.id} 
                      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary group bg-card border-border shadow-sm"
                      onClick={() => navigate.push(`/admin/enrichment/${project.id}?step=${stage.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-sm line-clamp-2 text-card-foreground">{project.name}</div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                          {project.developer}
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex gap-1 mt-3">
                           <div className={`h-1 flex-1 rounded-full ${project.pricePerSqm ? 'bg-emerald-500' : 'bg-muted'}`} title="Giá"></div>
                           <div className={`h-1 flex-1 rounded-full ${project.legalScore > 0 ? 'bg-emerald-500' : 'bg-muted'}`} title="Pháp lý"></div>
                           <div className={`h-1 flex-1 rounded-full ${project.description ? 'bg-emerald-500' : 'bg-muted'}`} title="Nội dung"></div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Cập nhật: Hôm nay</span>
                            <div className="text-xs font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                Xử lý <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {pipelineData[stage.id]?.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-muted-foreground/40 text-xs border-2 border-dashed border-border/50 rounded-lg bg-background/20">
                      Trống
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}