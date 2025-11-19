import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Building, CheckCircle, Clock, AlertTriangle,
  FileText, Truck, Home
} from "lucide-react";
import { Project } from "@/types/project";

interface ProjectProgressTabProps {
  project: Project;
}

const ProjectProgressTab = ({ project }: ProjectProgressTabProps) => {
  const actualProgress = project.soldUnits && project.totalUnits 
    ? Math.min(85, Math.round((project.soldUnits / project.totalUnits) * 100))
    : 65;

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
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "completed", 
      date: "15/12/2023",
      actualDate: project.completionDate === "Đã hoàn thành" ? "10/01/2024" : "10/01/2024",
      description: `Hoàn thành cất nóc tòa A (${project.floors || 30} tầng)`
    },
    { 
      name: "Cất nóc tòa B", 
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "in-progress", 
      date: "15/06/2024",
      actualDate: project.completionDate === "Đã hoàn thành" ? "10/06/2024" : null,
      description: project.completionDate === "Đã hoàn thành" ? "Đã hoàn thành" : "Đang thi công tầng 25/30"
    },
    { 
      name: "Hoàn thiện nội thất", 
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "pending", 
      date: "15/03/2025",
      actualDate: project.completionDate === "Đã hoàn thành" ? "01/03/2024" : null,
      description: "Hoàn thiện nội thất căn hộ mẫu"
    },
    { 
      name: "Nghiệm thu PCCC", 
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "pending", 
      date: "15/08/2025",
      actualDate: project.completionDate === "Đã hoàn thành" ? "01/08/2024" : null,
      description: "Nghiệm thu phòng cháy chữa cháy"
    },
    { 
      name: "Bàn giao", 
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "pending", 
      date: project.completionDate === "Đã hoàn thành" ? "Đã hoàn thành" : project.completionDate,
      actualDate: project.completionDate === "Đã hoàn thành" ? "15/12/2024" : null,
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
      status: project.status === "danger" ? "pending" : "completed",
      date: "15/03/2024",
      description: project.status === "danger" ? "Chưa có thông báo" : "Chấp thuận từ Sở Xây dựng"
    },
    {
      name: "Thư bảo lãnh ngân hàng",
      status: project.status === "danger" ? "pending" : "completed", 
      date: "20/03/2024",
      description: project.status === "danger" ? "Chưa có thư bảo lãnh" : "Vietcombank - 500 tỷ VNĐ"
    },
    {
      name: "Nghiệm thu PCCC",
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "pending",
      date: project.completionDate === "Đã hoàn thành" ? "Đã hoàn thành" : "Q2/2025",
      description: project.completionDate === "Đã hoàn thành" ? "Đã nghiệm thu" : "Chưa thực hiện nghiệm thu"
    },
    {
      name: "Cấp sổ đỏ",
      status: project.completionDate === "Đã hoàn thành" ? "completed" : "pending", 
      date: project.completionDate === "Đã hoàn thành" ? "Đã cấp" : "50 ngày sau bàn giao",
      description: project.completionDate === "Đã hoàn thành" ? "Đã cấp sổ đỏ" : "Theo NĐ 101/2024"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case "in-progress": return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
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
    <div className="space-y-6">
      {/* Progress Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 hover-scale cursor-pointer">
          <CardContent className="p-6 text-center">
            <Building className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary mb-1">{actualProgress}%</div>
            <div className="text-sm text-muted-foreground">Tiến độ</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 hover-scale cursor-pointer">
          <CardContent className="p-6 text-center">
            <Home className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{project.soldUnits || 890}</div>
            <div className="text-sm text-muted-foreground">Căn đã bán</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover-scale cursor-pointer">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {constructionMilestones.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 hover-scale cursor-pointer">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {constructionMilestones.filter(m => m.status === 'in-progress').length}
            </div>
            <div className="text-sm text-muted-foreground">Đang thực hiện</div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Progress Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">Tiến độ thi công</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-lg px-3 py-1">
              {actualProgress}%
            </Badge>
          </div>
          <Progress value={actualProgress} className="h-4 mb-3 bg-muted" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Khởi công: 15/01/2023</span>
            <span>Hoàn thành: {project.completionDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Tabs */}
      <Tabs defaultValue="construction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="construction">Thi công</TabsTrigger>
          <TabsTrigger value="legal">Pháp lý</TabsTrigger>
        </TabsList>

        <TabsContent value="construction" className="space-y-4">
          <div className="grid gap-4">
            {constructionMilestones.map((milestone, index) => (
              <Card 
                key={index} 
                className={`hover-scale cursor-pointer transition-all duration-200 ${
                  milestone.status === 'completed' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50' :
                  milestone.status === 'in-progress' ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50' :
                  'bg-card border-border'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-background shadow-sm">
                      {getStatusIcon(milestone.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-lg text-foreground">{milestone.name}</h4>
                        <Badge 
                          variant={milestone.status === "completed" ? "default" : 
                                  milestone.status === "in-progress" ? "secondary" : "outline"}
                          className="text-sm"
                        >
                          {getStatusText(milestone.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {milestone.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-background/60 rounded border border-border/50">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-foreground">KH: {milestone.date}</span>
                        </div>
                        {milestone.actualDate && (
                          <div className="flex items-center gap-2 p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-300">TT: {milestone.actualDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <div className="grid gap-4">
            {legalMilestones.map((milestone, index) => (
              <Card 
                key={index}
                className={`hover-scale cursor-pointer transition-all duration-200 ${
                  milestone.status === 'completed' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50' :
                  'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-background shadow-sm">
                      {getStatusIcon(milestone.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-lg text-foreground">{milestone.name}</h4>
                        <Badge 
                          variant={milestone.status === "completed" ? "default" : "outline"}
                          className="text-sm"
                        >
                          {getStatusText(milestone.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">
                        {milestone.description}
                      </p>
                      
                      <div className="flex items-center gap-2 p-2 bg-background/60 rounded text-sm border border-border/50">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{milestone.date}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Red Book Alert - Enhanced */}
          <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-amber-900 dark:text-amber-300 mb-2">Thông tin sổ đỏ</h4>
                  <p className="text-amber-800 dark:text-amber-400 leading-relaxed">
                    {project.completionDate === "Đã hoàn thành" 
                      ? "✅ Dự án đã hoàn thành và đã cấp sổ đỏ cho khách hàng."
                      : "⏳ Theo NĐ 101/2024, chủ đầu tư có 50 ngày để nộp hồ sơ cấp sổ từ khi bàn giao. Dự kiến ra sổ: Tháng 2/2026"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectProgressTab;