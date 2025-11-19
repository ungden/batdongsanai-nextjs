"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectsData } from "@/data/projectsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, ArrowRight, Search, Database, Map, 
  PenTool, CheckCircle, AlertCircle, MoreHorizontal 
} from "lucide-react";

// Định nghĩa các cột trạng thái (Stages)
const STAGES = [
  { id: 'new', title: '1. Mới / Sơ khai', icon: Search, color: 'bg-slate-100 border-slate-200' },
  { id: 'enriching', title: '2. Đang làm giàu data', icon: Database, color: 'bg-blue-50 border-blue-200' },
  { id: 'analyzing', title: '3. Phân tích thị trường', icon: Map, color: 'bg-amber-50 border-amber-200' },
  { id: 'content', title: '4. Soạn nội dung', icon: PenTool, color: 'bg-purple-50 border-purple-200' },
  { id: 'ready', title: '5. Sẵn sàng / Đã duyệt', icon: CheckCircle, color: 'bg-green-50 border-green-200' },
];

export default function ProjectPipeline() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Giả lập logic phân loại dự án vào các cột (Trong thực tế sẽ dựa vào field 'workflow_status' trong DB)
  const pipelineData = useMemo(() => {
    const columns: Record<string, typeof projectsData> = {
      new: [],
      enriching: [],
      analyzing: [],
      content: [],
      ready: []
    };

    projectsData.forEach(p => {
      // Logic giả lập để chia cột
      if (p.status === 'good' && p.description && p.priceHistory?.length) {
        columns.ready.push(p);
      } else if (p.description && p.amenities?.length) {
        columns.content.push(p);
      } else if (p.pricePerSqm > 0) {
        columns.analyzing.push(p);
      } else if (p.location) {
        columns.enriching.push(p);
      } else {
        columns.new.push(p);
      }
    });

    // Demo: Move some items to make board look populated
    if (columns.new.length === 0 && columns.ready.length > 0) {
        columns.new.push(columns.ready.pop()!);
        columns.enriching.push(columns.ready.pop()!);
    }

    return columns;
  }, [projectsData]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold">Quy trình dữ liệu (Pipeline)</h1>
          <p className="text-muted-foreground text-sm">Quản lý vòng đời dữ liệu dự án từ lúc tìm kiếm đến khi xuất bản</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/ai-scout")}>
            <Search className="mr-2 h-4 w-4" /> AI Scout (Tìm mới)
          </Button>
          <Button onClick={() => navigate("/admin/projects")}>
            <Plus className="mr-2 h-4 w-4" /> Tạo thủ công
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]">
          {STAGES.map(stage => (
            <div key={stage.id} className={`flex-1 flex flex-col min-w-[280px] rounded-xl border ${stage.color} bg-opacity-50`}>
              {/* Column Header */}
              <div className="p-3 border-b border-black/5 flex items-center justify-between bg-white/50 rounded-t-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <stage.icon className="w-4 h-4 opacity-70" />
                  {stage.title}
                </div>
                <Badge variant="secondary" className="bg-white">
                  {pipelineData[stage.id]?.length || 0}
                </Badge>
              </div>

              {/* Cards Area */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {pipelineData[stage.id]?.map(project => (
                    <Card 
                      key={project.id} 
                      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary group bg-white"
                      onClick={() => navigate(`/admin/enrichment/${project.id}?step=${stage.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-sm line-clamp-2">{project.name}</div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          {project.developer}
                        </div>

                        {/* Progress Indicators */}
                        <div className="flex gap-1 mt-3">
                            {/* Giả lập các chỉ số data */}
                           <div className={`h-1 flex-1 rounded-full ${project.pricePerSqm ? 'bg-green-400' : 'bg-gray-100'}`} title="Giá"></div>
                           <div className={`h-1 flex-1 rounded-full ${project.legalScore > 0 ? 'bg-green-400' : 'bg-gray-100'}`} title="Pháp lý"></div>
                           <div className={`h-1 flex-1 rounded-full ${project.description ? 'bg-green-400' : 'bg-gray-100'}`} title="Nội dung"></div>
                        </div>
                        
                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Cập nhật: Hôm nay</span>
                            <div className="text-xs font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                Xử lý <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {pipelineData[stage.id]?.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-muted-foreground/40 text-xs border-2 border-dashed rounded-lg">
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