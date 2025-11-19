import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectLegalTabProps {
  project: Project;
}

const ProjectLegalTab = ({ project }: ProjectLegalTabProps) => {
  const legalCriteria = [
    {
      name: "Thông báo đủ điều kiện bán",
      status: project.status === "good" ? "approved" : project.status === "warning" ? "pending" : "warning",
      date: "15/03/2024",
      description: "Văn bản chấp thuận từ Sở Xây dựng",
      riskLevel: project.status === "good" ? "low" : project.status === "warning" ? "medium" : "high",
    },
    {
      name: "Thư bảo lãnh ngân hàng", 
      status: project.status === "danger" ? "pending" : "approved",
      date: "20/03/2024",
      description: project.status === "danger" ? "Chưa có thư bảo lãnh" : "Vietcombank - 500 tỷ VNĐ",
      riskLevel: project.status === "danger" ? "high" : "low",
    },
    {
      name: "Nghiệm thu PCCC",
      status: project.completionDate === "Đã hoàn thành" ? "approved" : "pending",
      date: "Dự kiến Q2/2025",
      description: project.completionDate === "Đã hoàn thành" ? "Đã hoàn thành nghiệm thu" : "Chưa có nghiệm thu chính thức",
      riskLevel: project.completionDate === "Đã hoàn thành" ? "low" : "medium",
    },
    {
      name: "Quyền sử dụng đất",
      status: "approved", 
      date: "10/01/2024",
      description: "QSDĐ đầy đủ, thời hạn 50 năm",
      riskLevel: "low",
    },
    {
      name: "Tiến độ thanh toán",
      status: project.warnings.length > 0 ? "warning" : "approved",
      date: "Cập nhật 25/03/2024", 
      description: project.warnings.length > 0 ? project.warnings[0] : "Tuân thủ quy định",
      riskLevel: project.warnings.length > 0 ? "high" : "low",
    },
    {
      name: "Trạng thái thế chấp",
      status: "approved",
      date: "15/02/2024",
      description: "Đã giải chấp hoàn toàn",
      riskLevel: "low",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Đạt";
      case "pending": return "Đang xử lý";
      case "warning": return "Cảnh báo";
      default: return "Chưa rõ";
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 border-success/20">Thấp</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">Trung bình</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Cao</Badge>;
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>;
    }
  };

  const riskStats = {
    low: legalCriteria.filter(c => c.riskLevel === "low").length,
    medium: legalCriteria.filter(c => c.riskLevel === "medium").length,
    high: legalCriteria.filter(c => c.riskLevel === "high").length,
  };

  const overallScore = Math.round((riskStats.low * 100 + riskStats.medium * 50) / legalCriteria.length);
  
  // Dynamic classes based on score
  const scoreColorClass = overallScore >= 80 ? "text-success" : overallScore >= 60 ? "text-warning" : "text-destructive";
  const scoreBorderClass = overallScore >= 80 ? "border-success" : overallScore >= 60 ? "border-warning" : "border-destructive";
  
  // Card background based on score with dark mode support
  const cardBgClass = overallScore >= 80 
    ? "bg-success/10 dark:bg-success/20" 
    : overallScore >= 60 
      ? "bg-warning/10 dark:bg-warning/20" 
      : "bg-destructive/10 dark:bg-destructive/20";

  return (
    <div className="space-y-6">
      {/* Legal Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Gauge */}
        <Card className={`${cardBgClass} border-none shadow-sm`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4">
                {/* Gauge Background */}
                <div className="absolute inset-0 rounded-full border-8 border-background/30"></div>
                
                {/* Gauge Value */}
                <div 
                  className={`absolute inset-0 rounded-full border-8 border-transparent ${scoreBorderClass} transform -rotate-90 transition-all duration-1000 ease-out`}
                  style={{
                    borderTopColor: 'currentColor',
                    borderRightColor: overallScore > 25 ? 'currentColor' : 'transparent',
                    borderBottomColor: overallScore > 50 ? 'currentColor' : 'transparent',
                    borderLeftColor: overallScore > 75 ? 'currentColor' : 'transparent',
                  }}
                ></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${scoreColorClass}`}>{overallScore}</span>
                  <span className="text-xs font-medium uppercase opacity-70">Điểm số</span>
                </div>
              </div>
              
              <h3 className="font-bold text-xl mb-1">Điểm pháp lý</h3>
              <p className="text-sm opacity-80 max-w-[200px] mx-auto">
                {overallScore >= 80 ? "Hồ sơ pháp lý rất tốt, rủi ro thấp" : overallScore >= 60 ? "Hồ sơ pháp lý ở mức trung bình" : "Cần cân nhắc kỹ về pháp lý"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Breakdown */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Phân tích rủi ro
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-success/20 rounded-full text-success">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">Rủi ro thấp</span>
                </div>
                <div className="text-xl font-bold text-success">{riskStats.low}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-warning/20 rounded-full text-warning">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">Trung bình</span>
                </div>
                <div className="text-xl font-bold text-warning">{riskStats.medium}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-destructive/20 rounded-full text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-foreground">Rủi ro cao</span>
                </div>
                <div className="text-xl font-bold text-destructive">{riskStats.high}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Matrix - Visual Cards */}
      <div className="grid gap-4">
        <h3 className="text-xl font-bold text-foreground">Chi tiết hồ sơ pháp lý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legalCriteria.map((criteria, index) => (
            <Card 
              key={index} 
              className={`border shadow-sm transition-all duration-200 hover:shadow-md ${
                criteria.status === 'approved' ? 'bg-card border-success/20 hover:border-success/50' :
                criteria.status === 'pending' ? 'bg-card border-warning/20 hover:border-warning/50' :
                'bg-card border-destructive/20 hover:border-destructive/50'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                       {getStatusIcon(criteria.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">{criteria.name}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs bg-background/50">
                          {getStatusText(criteria.status)}
                        </Badge>
                        {getRiskBadge(criteria.riskLevel)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                  {criteria.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cập nhật: {criteria.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectLegalTab;