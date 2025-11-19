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
import MasterProjectEditor from "@/components/admin/MasterProjectEditor";
import ContentStudioEmbed from "@/components/admin/ContentStudioEmbed";

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("core_data");

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
             <div className="text-sm font-medium text-muted-foreground">Chất lượng dữ liệu</div>
             <div className="h-2 w-32 bg-muted rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-yellow-500 w-1/2"></div>
             </div>
           </div>
           <Button variant="outline" onClick={() => window.open(`/projects/${project.id}`, '_blank')}>
             Preview Website
           </Button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="core_data" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <Database className="w-4 h-4" /> 1. Dữ liệu lõi (Master Data)
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <Map className="w-4 h-4" /> 2. Yếu tố thị trường
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <PenTool className="w-4 h-4" /> 3. Sáng tạo nội dung
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm h-12">
            <CheckCircle2 className="w-4 h-4" /> 4. Review & Public
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
            {/* TAB 1: MASTER DATA EDITOR */}
            <TabsContent value="core_data" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-blue-800">
                    <strong>Hướng dẫn:</strong> Đây là nơi quản lý toàn bộ thông tin cứng của dự án. Bạn có thể dùng nút <strong>"AI Deep Scan"</strong> để tự động tìm và điền thông tin còn thiếu.
                </div>
                <MasterProjectEditor projectId={project.id} onSave={() => setActiveTab("market")} />
            </TabsContent>

            {/* TAB 2: MARKET CONTEXT */}
            <TabsContent value="market" className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 text-sm text-amber-800 flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <strong>Context:</strong> Tìm kiếm hạ tầng (Cầu, đường, Metro) xung quanh {project.district} để làm nổi bật tiềm năng tăng giá.
                </div>
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Module Catalyst Connect đang được tích hợp...</p>
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
                    <strong>Writer:</strong> Tạo bài viết chuẩn SEO dựa trên Dữ liệu lõi và Yếu tố thị trường đã nhập ở bước trước.
                </div>
                <ContentStudioEmbed project={project} onSuccess={() => {}} />
            </TabsContent>

             {/* TAB 4: REVIEW */}
             <TabsContent value="review" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Checklist xuất bản</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Dữ liệu tổng quan & thông số</span>
                                <Badge className="bg-green-500">Đã nhập</Badge>
                            </div>
                             <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Pháp lý & Giá</span>
                                <Badge variant="outline">Chưa kiểm tra</Badge>
                            </div>
                             <div className="flex justify-between p-3 bg-muted/30 rounded border">
                                <span>Hình ảnh</span>
                                <Badge variant="outline">Chưa có</Badge>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                             <Button variant="outline">Xem trước</Button>
                             <Button size="lg">Xuất bản ngay</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}