import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Clock, TrendingUp, AlertTriangle, CheckCircle, 
  Shield, FileText, Building, Gavel, DollarSign, XCircle,
  Star, Download, Eye, Filter, ChevronRight
} from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const LegalMatrix = () => {
  const isMobile = useIsMobile();
  const [selectedProject, setSelectedProject] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const projects = [
    {
      id: "1",
      name: "Vinhomes Grand Park",
      developer: "Vingroup",
      location: "Quận 9, TP.HCM",
      overallScore: 87,
      riskLevel: "low"
    },
    {
      id: "2", 
      name: "Masteri Thảo Điền",
      developer: "Masterise Group", 
      location: "Quận 2, TP.HCM",
      overallScore: 72,
      riskLevel: "medium"
    },
    {
      id: "3",
      name: "The Manor Central Park",
      developer: "Bitexco Group",
      location: "Quận Bình Thạnh, TP.HCM",
      overallScore: 65,
      riskLevel: "high"
    },
  ];

  const legalCategories = [
    { id: "licenses", name: "Giấy phép & Pháp lý", icon: Gavel, color: "text-blue-600 dark:text-blue-400" },
    { id: "financial", name: "Tài chính & Bảo lãnh", icon: DollarSign, color: "text-green-600 dark:text-green-400" },
    { id: "technical", name: "Kỹ thuật & Xây dựng", icon: Building, color: "text-orange-600 dark:text-orange-400" },
    { id: "legal", name: "Tuân thủ pháp luật", icon: Shield, color: "text-purple-600 dark:text-purple-400" },
  ];

  const legalCriteria = [
    // Licenses & Legal
    {
      category: "licenses",
      name: "Quyết định chủ trương đầu tư",
      status: "approved",
      date: "15/01/2024",
      description: "Quyết định số 1234/QĐ-UBND phê duyệt chủ trương",
      riskLevel: "low",
      score: 95,
      details: "Đã có quyết định chính thức từ UBND TP.HCM"
    },
    {
      category: "licenses", 
      name: "Quyền sử dụng đất",
      status: "approved",
      date: "10/01/2024", 
      description: "QSDĐ 158.2 ha, thời hạn 50 năm",
      riskLevel: "low",
      score: 92,
      details: "Sổ đỏ đầy đủ, không có tranh chấp"
    },
    {
      category: "licenses",
      name: "Giấy phép xây dựng",
      status: "approved", 
      date: "20/02/2024",
      description: "GPXD giai đoạn 1: 5000 căn hộ",
      riskLevel: "low",
      score: 88,
      details: "Đã cấp cho toàn bộ dự án giai đoạn 1"
    },
    {
      category: "licenses",
      name: "Thông báo đủ điều kiện bán",
      status: "approved",
      date: "15/03/2024", 
      description: "Văn bản chấp thuận từ Sở Xây dựng",
      riskLevel: "low",
      score: 90,
      details: "Đã được phê duyệt bán hàng chính thức"
    },
    {
      category: "licenses",
      name: "Giấy chứng nhận môi trường",
      status: "approved",
      date: "05/02/2024",
      description: "Đánh giá tác động môi trường",
      riskLevel: "low", 
      score: 85,
      details: "Cam kết xử lý nước thải, chất thải"
    },

    // Financial & Guarantee
    {
      category: "financial",
      name: "Thư bảo lãnh ngân hàng",
      status: "approved",
      date: "20/03/2024",
      description: "Vietcombank - 500 tỷ VNĐ",
      riskLevel: "low",
      score: 95,
      details: "Bảo lãnh hoàn trả tiền đặt cọc từ Vietcombank"
    },
    {
      category: "financial",
      name: "Tiến độ thanh toán",
      status: "warning",
      date: "Cập nhật 25/03/2024",
      description: "Đợt 1: 30% (vượt quy định 5%)",
      riskLevel: "high",
      score: 60,
      details: "Đợt thanh toán đầu cao hơn quy định"
    },
    {
      category: "financial",
      name: "Trạng thái thế chấp",
      status: "approved",
      date: "15/02/2024",
      description: "Đã giải chấp hoàn toàn",
      riskLevel: "low",
      score: 100,
      details: "Không còn khoản nợ thế chấp nào"
    },
    {
      category: "financial",
      name: "Tài khoản ký quỹ",
      status: "approved",
      date: "10/03/2024",
      description: "Mở tại Vietcombank chi nhánh Quận 1",
      riskLevel: "low",
      score: 88,
      details: "Tài khoản được giám sát bởi ngân hàng"
    },
    {
      category: "financial",
      name: "Báo cáo tài chính",
      status: "approved",
      date: "01/04/2024",
      description: "Báo cáo kiểm toán năm 2023",
      riskLevel: "low",
      score: 82,
      details: "Tình hình tài chính ổn định"
    },

    // Technical & Construction
    {
      category: "technical",
      name: "Thiết kế cơ sở",
      status: "approved",
      date: "25/01/2024",
      description: "Phê duyệt thiết kế tổng thể",
      riskLevel: "low", 
      score: 90,
      details: "Thiết kế đạt tiêu chuẩn quốc gia"
    },
    {
      category: "technical",
      name: "Nghiệm thu PCCC",
      status: "pending",
      date: "Dự kiến Q2/2025",
      description: "Chưa có nghiệm thu chính thức",
      riskLevel: "medium",
      score: 70,
      details: "Đang trong quá trình thẩm định"
    },
    {
      category: "technical",
      name: "Hạ tầng kỹ thuật",
      status: "approved",
      date: "10/02/2024",
      description: "Điện, nước, thoát nước đầy đủ",
      riskLevel: "low",
      score: 88,
      details: "Kết nối với hệ thống thành phố"
    },
    {
      category: "technical",
      name: "Tiến độ thi công",
      status: "approved",
      date: "Cập nhật 30/03/2024",
      description: "Đạt 65% theo kế hoạch",
      riskLevel: "low",
      score: 78,
      details: "Đúng tiến độ cam kết"
    },
    {
      category: "technical",
      name: "Chất lượng xây dựng",
      status: "approved",
      date: "15/03/2024",
      description: "Giám sát bởi tư vấn quốc tế",
      riskLevel: "low",
      score: 85,
      details: "Đạt tiêu chuẩn chất lượng cao"
    },

    // Legal Compliance  
    {
      category: "legal",
      name: "Tuân thủ luật nhà ở",
      status: "approved",
      date: "20/03/2024",
      description: "Đầy đủ theo Luật Nhà ở 2023",
      riskLevel: "low",
      score: 92,
      details: "Tuân thủ đầy đủ quy định mới"
    },
    {
      category: "legal",
      name: "Quy hoạch đô thị",
      status: "approved", 
      date: "05/01/2024",
      description: "Phù hợp quy hoạch chung TP.HCM",
      riskLevel: "low",
      score: 95,
      details: "Nằm trong vùng quy hoạch phát triển"
    },
    {
      category: "legal",
      name: "Nghĩa vụ thuế",
      status: "approved",
      date: "01/04/2024", 
      description: "Không có nợ thuế",
      riskLevel: "low",
      score: 100,
      details: "Hoàn thành nghĩa vụ thuế đầy đủ"
    },
    {
      category: "legal",
      name: "Tranh chấp pháp lý",
      status: "approved",
      date: "Kiểm tra 25/03/2024",
      description: "Không có tranh chấp",
      riskLevel: "low", 
      score: 98,
      details: "Không có vụ việc tại tòa án"
    },
    {
      category: "legal",
      name: "Chính sách bán hàng",
      status: "warning",
      date: "Cập nhật 20/03/2024",
      description: "Một số điều khoản cần làm rõ",
      riskLevel: "medium",
      score: 75,
      details: "Cần bổ sung một số điều khoản bảo vệ KH"
    },
  ];

  const filteredCriteria = selectedCategory === "all" 
    ? legalCriteria 
    : legalCriteria.filter(c => c.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Đạt";
      case "pending": return "Đang xử lý";
      case "warning": return "Cảnh báo";
      case "rejected": return "Không đạt";
      default: return "Chưa rõ";
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Thấp</Badge>;
      case "medium":
        return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Trung bình</Badge>;
      case "high":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Cao</Badge>;
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const riskStats = {
    low: legalCriteria.filter(c => c.riskLevel === "low").length,
    medium: legalCriteria.filter(c => c.riskLevel === "medium").length,
    high: legalCriteria.filter(c => c.riskLevel === "high").length,
  };

  const categoryStats = legalCategories.map(cat => ({
    ...cat,
    items: legalCriteria.filter(c => c.category === cat.id),
    averageScore: Math.round(
      legalCriteria
        .filter(c => c.category === cat.id)
        .reduce((sum, c) => sum + c.score, 0) / 
      legalCriteria.filter(c => c.category === cat.id).length
    )
  }));

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-primary text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Ma trận pháp lý</h1>
          <p className="text-white/80">Đánh giá chi tiết tình trạng pháp lý dự án</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Project Selector */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Chọn dự án</h3>
              <div className="grid grid-cols-1 gap-2">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="text-left w-full">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{project.name}</div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getScoreColor(project.overallScore)}`}>
                            {project.overallScore}/100
                          </span>
                          <Star className={`w-4 h-4 ${getScoreColor(project.overallScore)}`} />
                        </div>
                      </div>
                      <div className="text-sm opacity-70 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Điểm tổng thể</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(selectedProjectData?.overallScore || 0)}`}>
                    {selectedProjectData?.overallScore}/100
                  </span>
                  <Star className={`w-6 h-6 ${getScoreColor(selectedProjectData?.overallScore || 0)}`} />
                </div>
              </div>
              <Progress 
                value={selectedProjectData?.overallScore || 0} 
                className="w-full h-3 mb-3"
              />
              <div className="text-sm text-muted-foreground">
                Dựa trên {legalCriteria.length} tiêu chí pháp lý quan trọng
              </div>
            </CardContent>
          </Card>

          {/* Risk Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Phân bố rủi ro</h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">{riskStats.low}</div>
                  <div className="text-xs text-success">Rủi ro thấp</div>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">{riskStats.medium}</div>
                  <div className="text-xs text-warning">Rủi ro TB</div>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">{riskStats.high}</div>
                  <div className="text-xs text-destructive">Rủi ro cao</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Lọc theo danh mục</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Tất cả
                </Button>
                {legalCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs justify-start"
                  >
                    <category.icon className={`w-3 h-3 mr-1 ${category.color}`} />
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legal Criteria */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Chi tiết pháp lý ({filteredCriteria.length} tiêu chí)
            </h3>
            {filteredCriteria.map((criteria, index) => (
              <Card key={index} className="animate-fade-in card-modern">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(criteria.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{criteria.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {criteria.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`text-sm font-bold ${getScoreColor(criteria.score)}`}>
                            {criteria.score}/100
                          </div>
                          {getRiskBadge(criteria.riskLevel)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{criteria.date}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(criteria.status)}
                        </Badge>
                      </div>
                      {criteria.details && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          {criteria.details}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Tải báo cáo pháp lý PDF
            </Button>
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              So sánh với dự án khác
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout 
      title="Ma trận pháp lý" 
      subtitle="Đánh giá chi tiết tình trạng pháp lý dự án"
    >
      <div className="p-8 space-y-6">
        {/* Top Section - Project Selector & Overall Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Selector */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chọn dự án để phân tích</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? "default" : "outline"}
                    className="justify-between h-auto p-4"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm opacity-70 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location} • {project.developer}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(project.overallScore)}`}>
                          {project.overallScore}/100
                        </div>
                        <div className="text-xs text-muted-foreground">Điểm tổng</div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Điểm tổng thể
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(selectedProjectData?.overallScore || 0)}`}>
                  {selectedProjectData?.overallScore}/100
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedProjectData?.name}
                </div>
              </div>
              <Progress 
                value={selectedProjectData?.overallScore || 0} 
                className="w-full h-4"
              />
              <div className="text-center text-sm text-muted-foreground">
                Dựa trên {legalCriteria.length} tiêu chí pháp lý
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Risk Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Rủi ro thấp</h4>
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">{riskStats.low}</div>
              <div className="text-xs text-muted-foreground">tiêu chí</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Rủi ro trung bình</h4>
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div className="text-2xl font-bold text-warning">{riskStats.medium}</div>
              <div className="text-xs text-muted-foreground">tiêu chí</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Rủi ro cao</h4>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive">{riskStats.high}</div>
              <div className="text-xs text-muted-foreground">tiêu chí</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Tổng tiêu chí</h4>
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{legalCriteria.length}</div>
              <div className="text-xs text-muted-foreground">được đánh giá</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories & Criteria */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {legalCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <category.icon className={`w-4 h-4 mr-1 ${category.color}`} />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {/* Category Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryStats.map((category) => (
                <Card key={category.id} className="card-modern">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                      <div className={`text-xl font-bold ${getScoreColor(category.averageScore)}`}>
                        {category.averageScore}/100
                      </div>
                    </div>
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.items.length} tiêu chí
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* All Criteria Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {legalCriteria.map((criteria, index) => (
                <Card key={index} className="animate-fade-in card-modern interactive-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(criteria.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {(() => {
                                const categoryData = legalCategories.find(c => c.id === criteria.category);
                                if (categoryData) {
                                  const IconComponent = categoryData.icon;
                                  return <IconComponent className={`w-4 h-4 ${categoryData.color}`} />;
                                }
                                return null;
                              })()}
                              <h4 className="font-medium text-sm">{criteria.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {criteria.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`text-lg font-bold ${getScoreColor(criteria.score)}`}>
                              {criteria.score}
                            </div>
                            {getRiskBadge(criteria.riskLevel)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{criteria.date}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(criteria.status)}
                          </Badge>
                        </div>
                        {criteria.details && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                            {criteria.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Individual Category Tabs */}
          {legalCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {legalCriteria
                  .filter(c => c.category === category.id)
                  .map((criteria, index) => (
                    <Card key={index} className="animate-fade-in card-modern interactive-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(criteria.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{criteria.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {criteria.description}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className={`text-lg font-bold ${getScoreColor(criteria.score)}`}>
                                  {criteria.score}
                                </div>
                                {getRiskBadge(criteria.riskLevel)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{criteria.date}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {getStatusText(criteria.status)}
                              </Badge>
                            </div>
                            {criteria.details && (
                              <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                                {criteria.details}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Tải báo cáo pháp lý PDF
          </Button>
          <Button variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            So sánh với dự án khác
          </Button>
        </div>
      </div>
    </DesktopLayout>
  );
};

export default LegalMatrix;