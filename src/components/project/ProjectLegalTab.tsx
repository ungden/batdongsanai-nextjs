import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        return <Badge variant="secondary" className="bg-success/10 text-success">Thấp</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Trung bình</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive">Cao</Badge>;
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
  const scoreColor = overallScore >= 80 ? "text-success" : overallScore >= 60 ? "text-warning" : "text-destructive";
  const scoreBg = overallScore >= 80 ? "bg-success/10" : overallScore >= 60 ? "bg-warning/10" : "bg-destructive/10";

  return (
    <div className="space-y-6">
      {/* Legal Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Gauge */}
        <Card className={`${scoreBg} border-current/20`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                <div 
                  className={`absolute inset-0 rounded-full border-8 border-transparent ${scoreColor.replace('text-', 'border-')} transform -rotate-90`}
                  style={{
                    borderTopColor: 'currentColor',
                    borderRightColor: overallScore > 25 ? 'currentColor' : 'transparent',
                    borderBottomColor: overallScore > 50 ? 'currentColor' : 'transparent',
                    borderLeftColor: overallScore > 75 ? 'currentColor' : 'transparent',
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor}`}>{overallScore}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg">Điểm pháp lý</h3>
              <p className="text-sm text-muted-foreground">
                {overallScore >= 80 ? "Tốt" : overallScore >= 60 ? "Trung bình" : "Cần lưu ý"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Breakdown */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Phân tích rủi ro
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <span className="font-medium">Thấp</span>
                </div>
                <div className="text-2xl font-bold text-success">{riskStats.low}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-warning" />
                  <span className="font-medium">Trung bình</span>
                </div>
                <div className="text-2xl font-bold text-warning">{riskStats.medium}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                  <span className="font-medium">Cao</span>
                </div>
                <div className="text-2xl font-bold text-destructive">{riskStats.high}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Matrix - Visual Cards */}
      <div className="grid gap-4">
        <h3 className="text-xl font-bold">Ma trận pháp lý</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legalCriteria.map((criteria, index) => (
            <Card 
              key={index} 
              className={`animate-fade-in hover-scale cursor-pointer transition-all duration-200 ${
                criteria.status === 'approved' ? 'bg-success/5 border-success/20' :
                criteria.status === 'pending' ? 'bg-warning/5 border-warning/20' :
                'bg-destructive/5 border-destructive/20'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(criteria.status)}
                    <div>
                      <h4 className="font-semibold">{criteria.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(criteria.status)}
                        </Badge>
                        {getRiskBadge(criteria.riskLevel)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {criteria.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{criteria.date}</span>
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