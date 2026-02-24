"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { 
  Calendar, Building, CheckCircle, Clock, AlertTriangle,
  FileText, Users, Truck, Home, Award
} from "lucide-react";

const ProjectProgress = () => {
  const [selectedProject, setSelectedProject] = useState("1");

  const projectData = {
    name: "Vinhomes Grand Park",
    developer: "Vingroup",
    startDate: "15/01/2023",
    expectedCompletion: "Q4/2025",
    actualProgress: 65,
    totalUnits: 1250,
    soldUnits: 890,
    handoverUnits: 0,
  };

  const constructionMilestones = [
    { 
      name: "Khởi công", 
      status: "completed", 
      date: "15/01/2023",
      actualDate: "15/01/2023",
      description: "Lễ khởi công dự án"
    },
    { 
      name: "Đào móng", 
      status: "completed", 
      date: "15/03/2023",
      actualDate: "10/03/2023", 
      description: "Hoàn thành đào móng toàn dự án"
    },
    { 
      name: "Hoàn thành móng", 
      status: "completed", 
      date: "15/08/2023",
      actualDate: "20/08/2023",
      description: "Đổ bê tông móng các toà nhà"
    },
    { 
      name: "Cất nóc tòa A", 
      status: "completed", 
      date: "15/12/2023",
      actualDate: "10/01/2024",
      description: "Hoàn thành cất nóc tòa A (30 tầng)"
    },
    { 
      name: "Cất nóc tòa B", 
      status: "in-progress", 
      date: "15/06/2024",
      actualDate: null,
      description: "Đang thi công tầng 25/30"
    },
    { 
      name: "Hoàn thiện nội thất", 
      status: "pending", 
      date: "15/03/2025",
      actualDate: null,
      description: "Hoàn thiện nội thất căn hộ mẫu"
    },
    { 
      name: "Nghiệm thu PCCC", 
      status: "pending", 
      date: "15/08/2025",
      actualDate: null,
      description: "Nghiệm thu phòng cháy chữa cháy"
    },
    { 
      name: "Bàn giao", 
      status: "pending", 
      date: "15/12/2025",
      actualDate: null,
      description: "Bàn giao căn hộ cho khách hàng"
    },
  ];

  const legalMilestones = [
    {
      name: "Giấy phép xây dựng",
      status: "completed",
      date: "10/12/2022",
      description: "Đã có giấy phép xây dựng"
    },
    {
      name: "Thông báo đủ điều kiện bán", 
      status: "completed",
      date: "15/03/2024",
      description: "Chấp thuận từ Sở Xây dựng"
    },
    {
      name: "Thư bảo lãnh ngân hàng",
      status: "completed", 
      date: "20/03/2024",
      description: "Vietcombank - 500 tỷ VNĐ"
    },
    {
      name: "Nghiệm thu PCCC",
      status: "pending",
      date: "Q2/2025",
      description: "Chưa thực hiện nghiệm thu"
    },
    {
      name: "Cấp sổ đỏ",
      status: "pending", 
      date: "50 ngày sau bàn giao",
      description: "Theo NĐ 101/2024"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-success" />;
      case "in-progress": return <Clock className="w-5 h-5 text-warning" />;
      case "pending": return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "in-progress": return "Đang thực hiện";
      case "pending": return "Chưa bắt đầu";
      default: return "Chưa rõ";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-20">
      {/* Header - Soft Design */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Tiến độ dự án</h1>
          <p className="text-slate-600">Theo dõi tiến độ thi công và pháp lý</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Project Overview - Soft Rounded */}
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Building className="w-5 h-5 text-primary" />
              {projectData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm">
                <div className="text-2xl font-bold text-primary">{projectData.actualProgress}%</div>
                <div className="text-xs text-slate-600 mt-1">Tiến độ hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">{projectData.soldUnits}</div>
                <div className="text-xs text-slate-600 mt-1">Căn đã bán</div>
              </div>
            </div>
            
            <div className="space-y-2 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">Tiến độ thi công</span>
                <span className="font-bold text-primary">{projectData.actualProgress}%</span>
              </div>
              <Progress value={projectData.actualProgress} className="h-3 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs text-slate-600">Khởi công</div>
                  <div className="font-semibold text-slate-900">{projectData.startDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl">
                <Home className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs text-slate-600">Dự kiến</div>
                  <div className="font-semibold text-slate-900">{projectData.expectedCompletion}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Tabs - Soft Design */}
        <Tabs defaultValue="construction" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm">
            <TabsTrigger value="construction" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl font-semibold">
              Thi công
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl font-semibold">
              Pháp lý
            </TabsTrigger>
          </TabsList>

          <TabsContent value="construction" className="space-y-4">
            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Truck className="w-5 h-5 text-primary" />
                  Timeline thi công
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {constructionMilestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < constructionMilestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-16 bg-gradient-to-b from-slate-300 to-slate-200"></div>
                    )}
                    
                    <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                      milestone.status === 'completed' ? 'bg-gradient-to-br from-emerald-50 to-teal-50' :
                      milestone.status === 'in-progress' ? 'bg-gradient-to-br from-amber-50 to-orange-50' :
                      'bg-gradient-to-br from-slate-50 to-slate-100/50'
                    }`}>
                      <div className="flex-shrink-0">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900">{milestone.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge variant={milestone.status === "completed" ? "default" : 
                                        milestone.status === "in-progress" ? "secondary" : "outline"}
                                 className="rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
                            {getStatusText(milestone.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/70 rounded-full">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span className="text-slate-700">KH: {milestone.date}</span>
                          </div>
                          {milestone.actualDate && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100/70 rounded-full">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">TT: {milestone.actualDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <FileText className="w-5 h-5 text-primary" />
                  Timeline pháp lý
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {legalMilestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < legalMilestones.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-16 bg-gradient-to-b from-slate-300 to-slate-200"></div>
                    )}
                    
                    <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                      milestone.status === 'completed' ? 'bg-gradient-to-br from-emerald-50 to-teal-50' :
                      'bg-gradient-to-br from-amber-50 to-orange-50'
                    }`}>
                      <div className="flex-shrink-0">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900">{milestone.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {milestone.description}
                            </p>
                          </div>
                          <Badge variant={milestone.status === "completed" ? "default" : "outline"}
                                 className="rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
                            {getStatusText(milestone.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-xs px-3 py-1.5 bg-white/70 rounded-full w-fit">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-slate-700">{milestone.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Red Book Alert - Soft Design */}
            <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-amber-100 shadow-sm">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-amber-900 mb-2">Thông tin sổ đỏ</h4>
                    <p className="text-slate-700 leading-relaxed">
                      ⏳ Theo NĐ 101/2024, chủ đầu tư có 50 ngày để nộp hồ sơ cấp sổ từ khi bàn giao. Dự kiến ra sổ: Tháng 2/2026
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions - Soft Rounded */}
        <div className="space-y-3">
          <Button className="w-full h-12 rounded-xl shadow-md hover:shadow-lg transition-all">
            <FileText className="w-4 h-4 mr-2" />
            Tải báo cáo tiến độ
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl border-2 hover:bg-slate-50 transition-all">
            <Users className="w-4 h-4 mr-2" />
            Liên hệ chủ đầu tư
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProjectProgress;