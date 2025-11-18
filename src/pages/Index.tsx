import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import CompactProjectCard from "@/components/home/CompactProjectCard";
import ProjectColumns from "@/components/home/ProjectColumns";
import { projectsData } from "@/data/projectsData";
import { 
  Search, 
  Calculator, 
  TrendingUp, 
  Building2, 
  Star, 
  Shield, 
  Award,
  Users,
  ChevronRight,
  Sparkles
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { trackProjectView } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProjects = useMemo(() => {
    return projectsData
      .filter(project => project.legalScore >= 8)
      .slice(0, 6);
  }, []);

  const stats = useMemo(() => {
    const total = projectsData.length;
    const goodLegal = projectsData.filter(p => p.legalScore >= 8).length;
    const avgLegal = projectsData.reduce((sum, p) => sum + p.legalScore, 0) / total;
    const safetyRate = Math.round((goodLegal / total) * 100);
    
    return { total, goodLegal, avgLegal: avgLegal.toFixed(1), safetyRate };
  }, []);

  const handleProjectClick = (id: string) => {
    const project = projectsData.find(p => p.id === id);
    if (project) {
      trackProjectView(id, project.name);
    }
    navigate(`/projects/${id}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'search':
        navigate(`/search${searchQuery ? `?q=${searchQuery}` : ''}`);
        break;
      case 'calculator':
        navigate('/calculator');
        break;
      case 'market':
        navigate('/market-overview');
        break;
      case 'projects':
        navigate('/projects');
        break;
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="card-hero rounded-2xl p-8 text-center">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-headline-1 text-white font-black">
              PropertyHub
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Nền tảng phân tích và đầu tư bất động sản thông minh hàng đầu Việt Nam
          </p>
          
          {/* Quick Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
            <Input
              placeholder="Tìm dự án, chủ đầu tư, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuickAction('search')}
              className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-xl"
            />
            <Button 
              onClick={() => handleQuickAction('search')}
              className="absolute right-2 top-2 h-10 px-6 bg-white text-primary hover:bg-white/90"
            >
              Tìm
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-stats text-center p-4">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-white" />
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-sm text-white/80">Dự án</div>
        </Card>
        <Card className="card-stats text-center p-4">
          <Shield className="w-8 h-8 mx-auto mb-2 text-white" />
          <div className="text-2xl font-black text-white">{stats.goodLegal}</div>
          <div className="text-sm text-white/80">Pháp lý tốt</div>
        </Card>
        <Card className="card-stats text-center p-4">
          <Star className="w-8 h-8 mx-auto mb-2 text-white" />
          <div className="text-2xl font-black text-white">{stats.avgLegal}</div>
          <div className="text-sm text-white/80">Điểm TB</div>
        </Card>
        <Card className="card-stats text-center p-4">
          <Award className="w-8 h-8 mx-auto mb-2 text-white" />
          <div className="text-2xl font-black text-white">{stats.safetyRate}%</div>
          <div className="text-sm text-white/80">An toàn</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => handleQuickAction('search')}
          className="btn-modern h-16 flex-col gap-2 bg-gradient-primary text-white"
        >
          <Search className="w-6 h-6" />
          <span className="font-semibold">Tìm kiếm</span>
        </Button>
        <Button 
          onClick={() => handleQuickAction('calculator')}
          className="btn-modern h-16 flex-col gap-2 bg-gradient-accent text-white"
        >
          <Calculator className="w-6 h-6" />
          <span className="font-semibold">Tính toán</span>
        </Button>
        <Button 
          onClick={() => handleQuickAction('market')}
          className="btn-modern h-16 flex-col gap-2 bg-gradient-subtle border-primary/20"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="font-semibold">Thị trường</span>
        </Button>
      </div>

      {/* Featured Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-headline-3">Dự án nổi bật</h2>
            <p className="text-muted-foreground">Các dự án có pháp lý tốt nhất</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => handleQuickAction('projects')}
            className="flex items-center gap-2"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {featuredProjects.slice(0, 3).map((project) => (
              <CompactProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        ) : (
          <ProjectColumns 
            projects={featuredProjects} 
            onProjectClick={handleProjectClick} 
          />
        )}
      </div>

      {/* Call to Action */}
      <Card className="card-blue text-center p-8">
        <div className="space-y-4">
          <Users className="w-12 h-12 mx-auto text-primary" />
          <h3 className="text-2xl font-bold text-primary">
            Tham gia cộng đồng đầu tư thông minh
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Nhận thông tin cập nhật về thị trường và các cơ hội đầu tư tốt nhất
          </p>
          {!user && (
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-gradient"
            >
              Đăng ký ngay
            </Button>
          )}
        </div>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="PropertyHub - Nền tảng đầu tư BĐS thông minh"
          description="Phân tích pháp lý, tính toán ROI và khám phá cơ hội đầu tư bất động sản tốt nhất tại Việt Nam"
          keywords="bất động sản, đầu tư, pháp lý, ROI, dự án"
        />
        <div className="min-h-screen bg-background pb-20">
          <div className="p-4">
            {content}
          </div>
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="PropertyHub - Nền tảng đầu tư BĐS thông minh"
        description="Phân tích pháp lý, tính toán ROI và khám phá cơ hội đầu tư bất động sản tốt nhất tại Việt Nam"
        keywords="bất động sản, đầu tư, pháp lý, ROI, dự án"
      />
      <DesktopLayout 
        title="Chào mừng đến PropertyHub" 
        subtitle="Nền tảng đầu tư BĐS thông minh"
      >
        {content}
      </DesktopLayout>
    </>
  );
};

export default Index;
