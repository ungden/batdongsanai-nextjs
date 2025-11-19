"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsData } from "@/data/projectsData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, Sparkles, Map, PenTool, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import Embedded Tools
import ResearchFactoryEmbed from "@/components/admin/ResearchFactoryEmbed";
import ContentStudioEmbed from "@/components/admin/ContentStudioEmbed";

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analysis");

  const project = projectsData.find(p => p.id === id);

  if (!project) return <div>Dự án không tồn tại</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/enrichment")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge variant="outline">{project.developer}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{project.location} • {project.priceRange}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="text-right mr-4">
             <div className="text-sm font-medium text-muted-foreground">Tiến độ dữ liệu</div>
             <div className="h-2 w-32 bg-muted rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-primary w-1/3"></div>
             </div>
           </div>
           <Button variant="outline" onClick={() => window.open(`/projects/${project.id}`, '_blank')}>
             Xem trên Web
           </Button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="analysis" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <Sparkles className="w-4 h-4" /> 1. Phân tích sâu (Deep Dive)
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <Map className="w-4 h-4" /> 2. Dữ liệu thị trường
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <PenTool className="w-4 h-4" /> 3. Sáng tạo nội dung
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <CheckCircle2 className="w-4 h-4" /> 4. Review & Public
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
            {/* TAB 1: RESEARCH */}
            <TabsContent value="analysis" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-sm text-blue-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <strong>Nhiệm vụ:</strong> Tìm kiếm brochure, thông tin pháp lý, hoặc bài review chi tiết về dự án và paste vào đây để AI trích xuất dữ liệu có cấu trúc.
                </div>
                <ResearchFactoryEmbed project={project} onSuccess={() => setActiveTab("market")} />
            </TabsContent>

            {/* TAB 2: MARKET (Placeholder for now, connect to Catalyst later) */}
            <TabsContent value="market" className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 text-sm text-amber-800 flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <strong>Nhiệm vụ:</strong> Tìm kiếm các dự án hạ tầng (Cầu, đường, Metro) xung quanh {project.district} để thêm vào hồ sơ.
                </div>
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Tính năng kết nối Catalyst đang được tích hợp...</p>
                        <Button className="mt-4" variant="outline" onClick={() => navigate("/admin/catalyst-factory")}>
                            Mở Catalyst Factory (Tab mới)
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* TAB 3: CONTENT */}
            <TabsContent value="content" className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6 text-sm text-purple-800 flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    <strong>Nhiệm vụ:</strong> Tạo ít nhất 1 bài viết giới thiệu và 1 bài phân tích tiềm năng cho dự án này.
                </div>
                <ContentStudioEmbed project={project} onSuccess={() => {}} />
            </TabsContent>

             {/* TAB 4: REVIEW */}
             <TabsContent value="review" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Tổng quan dữ liệu hiện có</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Thông tin cơ bản</span>
                                <Badge className="bg-green-500">Hoàn tất</Badge>
                            </div>
                             <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Báo cáo phân tích (Project Report)</span>
                                <Badge variant="outline">Đang kiểm tra...</Badge>
                            </div>
                             <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Bài viết (News/Blog)</span>
                                <Badge variant="outline">Đang kiểm tra...</Badge>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                             <Button size="lg">Xuất bản dự án</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}