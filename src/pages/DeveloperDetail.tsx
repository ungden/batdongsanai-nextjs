import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopLayout from "@/components/layout/DesktopLayout";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import ProjectCard from "@/components/project/ProjectCard";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { DeveloperAnalytics } from "@/components/developer/DeveloperAnalytics";
import { RecentProjectsTable } from "@/components/developer/RecentProjectsTable";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getDeveloperByName } from "@/data/developersData";
import { projectsData } from "@/data/projectsData";
import { calculateROI, getROICategory } from "@/utils/roiCalculations";
import { Building2, MapPin, Phone, Mail, Globe, Calendar, TrendingUp, Award, BarChart3, ArrowLeft, Home, Users } from "lucide-react";

const DeveloperDetail = () => {
  const { developerId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { trackProjectView } = useAnalytics();
  const [sortBy, setSortBy] = useState("newest");

  // Find developer by converting developerId back to developer name
  const developer = useMemo(() => {
    const developerName = developerId?.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return getDeveloperByName(developerName || "");
  }, [developerId]);

  // Filter projects by developer
  const developerProjects = useMemo(() => {
    if (!developer) return [];
    return projectsData.filter(project => project.developer === developer.name);
  }, [developer]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    const projects = [...developerProjects];
    switch (sortBy) {
      case "price-low":
        return projects.sort((a, b) => a.pricePerSqm - b.pricePerSqm);
      case "price-high":
        return projects.sort((a, b) => b.pricePerSqm - a.pricePerSqm);
      case "legal-score":
        return projects.sort((a, b) => b.legalScore - a.legalScore);
      case "newest":
      default:
        return projects.sort((a, b) => new Date(b.launchDate || "").getTime() - new Date(a.launchDate || "").getTime());
    }
  }, [developerProjects, sortBy]);

  const handleProjectClick = (projectId: string) => {
    const project = projectsData.find(p => p.id === projectId);
    if (project) {
      trackProjectView(projectId, project.name);
    }
    navigate(`/projects/${projectId}`);
  };

  if (!developer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy chủ đầu tư</h1>
          <Button onClick={() => navigate("/projects")}>Quay lại danh sách dự án</Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalUnits = developerProjects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
  const avgROI = developerProjects.reduce((sum, p) => {
    const roi = p.launchPrice && p.currentPrice ? calculateROI(p.launchPrice, p.currentPrice) : 0;
    return sum + roi;
  }, 0) / (developerProjects.length || 1);

  const statusCounts = {
    good: developerProjects.filter(p => p.status === "good").length,
    warning: developerProjects.filter(p => p.status === "warning").length,
    danger: developerProjects.filter(p => p.status === "danger").length
  };

  // Breadcrumb data for SEO
  const breadcrumbItems = [
    { name: "Trang chủ", url: "/" },
    { name: "Chủ đầu tư", url: "/developers" },
    { name: developer.name, url: `/developers/${developerId}` }
  ];

  const content = (
    <div className="space-y-4 md:space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                Trang chủ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/developers" className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Chủ đầu tư
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{developer.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button 
          variant="outline" 
          onClick={() => navigate("/developers")}
          className="btn-modern flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Button>
      </div>

      {/* Schema markup for SEO */}
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Developer Header */}
      <Card className="card-elevated overflow-hidden bg-gradient-subtle">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-primary/20 shadow-glow">
                <AvatarImage src={developer.logo} alt={developer.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                  {developer.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-success text-success-foreground rounded-full p-1.5 shadow-md">
                <Award className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <h1 className="text-headline-2 bg-gradient-primary bg-clip-text text-transparent">
                  {developer.name}
                </h1>
                <p className="text-body text-muted-foreground leading-relaxed">{developer.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {developer.specialties?.map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="interactive-hover bg-gradient-subtle border-primary/20 text-primary"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-primary/5 border border-primary/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-black text-primary mb-1">{developer.totalProjects}</div>
                  <div className="text-caption">Dự án</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 border border-success/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-black text-success mb-1">{totalUnits.toLocaleString()}</div>
                  <div className="text-caption">Căn hộ</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-black text-warning mb-1">{developer.avgLegalScore}/10</div>
                  <div className="text-caption">Điểm pháp lý</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl font-black text-accent mb-1">{getROICategory(avgROI)}</div>
                  <div className="text-caption">ROI TB</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Details */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-headline-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              Thông tin liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {developer.hotline && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{developer.hotline}</span>
              </div>
            )}
            {developer.email && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <span className="font-medium">{developer.email}</span>
              </div>
            )}
            {developer.website && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Globe className="w-4 h-4 text-success" />
                </div>
                <a href={developer.website} target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:text-primary/80 font-medium transition-colors">{developer.website}</a>
              </div>
            )}
            {developer.address && (
              <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-warning/10 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-warning" />
                </div>
                <span className="text-body font-medium leading-relaxed">{developer.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-headline-3">
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Award className="w-5 h-5 text-accent" />
              </div>
              Thông tin công ty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {developer.establishedYear && (
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Thành lập năm {developer.establishedYear}</span>
              </div>
            )}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 bg-success/10 rounded-lg">
                <Building2 className="w-4 h-4 text-success" />
              </div>
              <span className="font-medium">{developer.completedProjects} dự án hoàn thành</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium">Rating: {developer.avgRating}/5.0</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 bg-warning/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
              <div className="space-y-1">
                <div className="font-medium">Phân bố trạng thái dự án:</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-success">{statusCounts.good} tốt</span>
                  <span className="text-warning">{statusCounts.warning} cảnh báo</span>
                  <span className="text-destructive">{statusCounts.danger} rủi ro</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Projects Section with Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/30 p-1">
          <TabsTrigger value="analytics" className="font-semibold data-[state=active]:shadow-lg">
            📊 Phân tích & Thống kê
          </TabsTrigger>
          <TabsTrigger value="table" className="font-semibold data-[state=active]:shadow-lg">
            📋 Bảng dự án chi tiết
          </TabsTrigger>
          <TabsTrigger value="cards" className="font-semibold data-[state=active]:shadow-lg">
            🏗️ Danh sách dự án
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4 md:space-y-6">
          <DeveloperAnalytics developer={developer} projects={developerProjects} />
        </TabsContent>

        <TabsContent value="table" className="space-y-4 md:space-y-6">
          <RecentProjectsTable projects={sortedProjects} onProjectClick={handleProjectClick} />
        </TabsContent>

        <TabsContent value="cards" className="space-y-4 md:space-y-6">
          <Card className="card-elevated">
            <CardHeader className="pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-headline-3">Dự án của {developer.name}</CardTitle>
                  <p className="text-muted-foreground">
                    {sortedProjects.length} dự án được tìm thấy
                  </p>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] btn-modern">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-low">Giá thấp - cao</SelectItem>
                    <SelectItem value="price-high">Giá cao - thấp</SelectItem>
                    <SelectItem value="legal-score">Điểm pháp lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {sortedProjects.length > 0 ? (
                <div className="grid gap-6">
                  {sortedProjects.map((project, index) => (
                    <div 
                      key={project.id}
                      className="animate-fade-in interactive-hover"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProjectCard
                        project={project}
                        onClick={handleProjectClick}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-muted/30 rounded-xl max-w-md mx-auto">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-body text-muted-foreground">Chưa có dự án nào được công bố</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/projects")}
                      className="mt-4 btn-modern"
                    >
                      Xem tất cả dự án
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          {content}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title={`Chủ đầu tư: ${developer.name}`} subtitle={`${developer.totalProjects} dự án`}>
      <div className="max-w-none -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
        {content}
      </div>
    </DesktopLayout>
  );
};

export default DeveloperDetail;