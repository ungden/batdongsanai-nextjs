"use client";
import { useRouter , useParams, useSearchParams } from 'next/navigation';

import { useEffect, useState } from "react";

// REMOVED: import { projectsData } from "@/data/projectsData"; 
import { useProjectDetail } from "@/hooks/useProjects"; // ADDED: Fetch real data
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, Map, PenTool, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import Embedded Tools
import MasterProjectEditor from "@/components/admin/MasterProjectEditor";
import ContentStudioEmbed from "@/components/admin/ContentStudioEmbed";
import ResearchFactoryEmbed from "@/components/admin/ResearchFactoryEmbed";

const STEPS = [
  { id: "core_data", label: "1. Dữ liệu lõi", icon: Database, description: "Thông tin cơ bản, giá, pháp lý" },
  { id: "market", label: "2. Nghiên cứu sâu", icon: Map, description: "Phân tích đối thủ, hạ tầng, rủi ro" },
  { id: "content", label: "3. Nội dung", icon: PenTool, description: "Viết bài SEO, PR, tin tức" },
  { id: "review", label: "4. Xuất bản", icon: CheckCircle2, description: "Kiểm tra cuối cùng & Public" },
];

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  
  // Lấy step từ URL hoặc mặc định là bước đầu tiên
  const initialStep = searchParams.get('step') === 'enriching' ? 'core_data' 
                    : searchParams.get('step') === 'analyzing' ? 'market'
                    : searchParams.get('step') === 'content' ? 'content'
                    : 'core_data';

  const [activeTab, setActiveTab] = useState(initialStep);

  // SỬA ĐỔI: Dùng hook để lấy dữ liệu thật từ Supabase
  const { project, loading, refetch } = useProjectDetail(id as string);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Dự án không tồn tại</h2>
      <p className="text-muted-foreground">Có thể dự án đã bị xóa hoặc ID không đúng.</p>
      <Button onClick={() => navigate.push("/admin/pipeline")}>Quay về Pipeline</Button>
    </div>
  );

  // Tính toán tiến độ hoàn thành (Logic hiển thị)
  const progress = (() => {
    let score = 0;
    if (project.pricePerSqm) score += 25;
    if (project.legalScore > 0) score += 25;
    if (project.description && project.description.length > 100) score += 25;
    if (project.amenities?.length) score += 25;
    return score;
  })();

  const handleNextStep = () => {
    refetch(); // Refresh data before moving
    const currentIndex = STEPS.findIndex(s => s.id === activeTab);
    if (currentIndex < STEPS.length - 1) {
      setActiveTab(STEPS[currentIndex + 1].id);
    } else {
      navigate.push('/admin/pipeline'); // Done
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-card border-b sticky top-0 z-10 px-6 py-3 flex items-center justify-between shadow-sm -mx-6 md:-mx-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate.push("/admin/pipeline")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Quy trình
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              {project.name}
              <Badge variant="outline" className="font-normal">{project.developer}</Badge>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:block text-right">
             <div className="text-xs text-muted-foreground mb-1">Hoàn thiện dữ liệu</div>
             <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
             </div>
           </div>
           <Button onClick={handleNextStep} className="shadow-md">
             Tiếp theo <ChevronRight className="w-4 h-4 ml-1" />
           </Button>
        </div>
      </div>

      {/* Wizard Steps Visualizer */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, index) => {
          const isActive = activeTab === step.id;
          const isPast = STEPS.findIndex(s => s.id === activeTab) > index;
          
          return (
            <div 
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${isActive ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : ''}
                ${isPast ? 'bg-muted/50 border-transparent opacity-70' : 'bg-card border-border'}
                hover:border-primary/50
              `}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${isActive ? 'bg-primary text-primary-foreground' : isPast ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {isPast ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`font-semibold ${isActive ? 'text-primary' : ''}`}>{step.label.split('. ')[1]}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-11">{step.description}</p>
              
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="absolute top-1/2 -right-3 z-10 text-muted-foreground/30">
                  <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* TAB 1: MASTER DATA (Dữ liệu cứng) */}
            <TabsContent value="core_data" className="space-y-6 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" /> 
                        Dữ liệu lõi dự án
                    </h2>
                    <p className="text-sm text-muted-foreground">Sử dụng AI để quét thông tin kỹ thuật, giá bán và pháp lý.</p>
                </div>
                <MasterProjectEditor projectId={project.id} onSave={handleNextStep} />
            </TabsContent>

            {/* TAB 2: RESEARCH (Phân tích sâu) */}
            <TabsContent value="market" className="space-y-6 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Map className="w-5 h-5 text-amber-500" /> 
                        Nghiên cứu thị trường & Phân tích sâu
                    </h2>
                </div>
                
                <div className="grid gap-6">
                    <ResearchFactoryEmbed project={project} onSuccess={() => toast.success("Đã cập nhật báo cáo phân tích")} />
                </div>
            </TabsContent>

            {/* TAB 3: CONTENT (Viết bài) */}
            <TabsContent value="content" className="space-y-6 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-purple-500" /> 
                        Content Studio
                    </h2>
                    <p className="text-sm text-muted-foreground">AI Writer chuyên nghiệp cho Bất động sản.</p>
                </div>
                <ContentStudioEmbed project={project} onSuccess={() => {}} />
            </TabsContent>

             {/* TAB 4: REVIEW (Duyệt) */}
             <TabsContent value="review" className="space-y-6 animate-in fade-in-50">
                <Card className="max-w-3xl mx-auto border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Sẵn sàng xuất bản?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${project.pricePerSqm ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="font-medium">Dữ liệu giá & Chính sách</span>
                                </div>
                                <Badge variant={project.pricePerSqm ? "default" : "destructive"}>
                                    {project.pricePerSqm ? "Đầy đủ" : "Thiếu"}
                                </Badge>
                            </div>
                            
                             <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${project.legalScore > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="font-medium">Hồ sơ pháp lý</span>
                                </div>
                                <Badge variant={project.legalScore > 0 ? "default" : "secondary"}>
                                    {project.legalScore > 0 ? `${project.legalScore}/10` : "Chưa đánh giá"}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="font-medium">Bài viết Content (SEO)</span>
                                </div>
                                <Button variant="link" size="sm">Xem 2 bài viết nháp</Button>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end gap-4">
                             <Button variant="outline" onClick={() => window.open(`/projects/${project.id}`, '_blank')}>
                                <Eye className="w-4 h-4 mr-2" /> Xem trước Website
                             </Button>
                             <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Xuất bản dự án
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}