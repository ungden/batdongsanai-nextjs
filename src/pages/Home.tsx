"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import SEOHead from "@/components/seo/SEOHead";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/components/seo/SchemaMarkup";
import { Search, TrendingUp, Calculator, Users, Newspaper, ArrowRight, Building2, Sparkles, BarChart3, Zap, Shield, Target } from "lucide-react";
import { projectsData } from "@/data/projectsData";
import CompactProjectCard from "@/components/home/CompactProjectCard";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProjects = useMemo(() => {
    return projectsData
      .filter(project => project.legalScore >= 8)
      .slice(0, 8);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackEvent({
        action: 'search_from_home',
        category: 'Search',
        label: searchQuery
      });
      navigate(`/market-overview?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/market-overview');
    }
  };

  const handleProjectClick = (id: string) => {
    const project = projectsData.find(p => p.id === id);
    if (project) {
      trackEvent({
        action: 'click_featured_project',
        category: 'Home',
        label: project.name
      });
    }
    navigate(`/projects/${id}`);
  };

  const combinedSchema = [
    generateOrganizationSchema(),
    generateWebsiteSchema()
  ];

  const content = (
    <div className="space-y-8">
      {/* Hero Section - Xanh dương chuyên nghiệp */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 shadow-2xl">
        {/* Decorative elements - subtle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold shadow-lg border border-white/20">
            <Sparkles className="w-4 h-4" />
            Nền tảng phân tích BĐS hàng đầu Việt Nam
          </div>
          
          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight">
              PropertyHub
            </h1>
            <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed">
              Tìm kiếm và so sánh dự án bất động sản thông minh với công nghệ AI
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto pt-4">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-3">
              <Search className="ml-3 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm dự án, khu vực, chủ đầu tư..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 bg-transparent"
              />
              <Button 
                onClick={handleSearch}
                size="lg"
                className="h-12 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-6">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">{projectsData.length}+</div>
              <div className="text-white/80 text-sm font-medium">Dự án</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">50+</div>
              <div className="text-white/80 text-sm font-medium">Chủ đầu tư</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">10K+</div>
              <div className="text-white/80 text-sm font-medium">Người dùng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <Card 
        className="border-0 cursor-pointer group hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden"
        onClick={() => navigate('/market-overview')}
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardContent className="relative p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">
                Xem tất cả dự án
              </h2>
              <p className="text-muted-foreground text-base">
                Khám phá <span className="font-bold text-primary">{projectsData.length}</span> dự án với bộ lọc và so sánh chi tiết
              </p>
            </div>
            <div className="hidden md:block">
              <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all">
                <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Màu đơn sắc */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="border-0 cursor-pointer group hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/calculator')}
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="relative p-6">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-primary rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Tính toán đầu tư
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tính toán chi phí và lợi nhuận đầu tư chính xác với công cụ AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="border-0 cursor-pointer group hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/developers')}
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="relative p-6">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-primary rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Chủ đầu tư
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thông tin chi tiết các chủ đầu tư uy tín và đánh giá pháp lý
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="border-0 cursor-pointer group hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
          onClick={() => navigate('/news')}
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="relative p-6">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-primary rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Tin tức BĐS
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cập nhật tin tức thị trường mới nhất và xu hướng đầu tư
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-black text-foreground">
                Dự án nổi bật
              </h2>
            </div>
            <p className="text-muted-foreground text-base ml-12">
              Các dự án được đánh giá cao nhất với pháp lý minh bạch
            </p>
          </div>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/market-overview')}
            className="flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30 rounded-xl px-6 h-12 font-semibold"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((project) => (
            <CompactProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Phân tích nhanh</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Công nghệ AI phân tích dự án trong vài giây với độ chính xác cao
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Pháp lý minh bạch</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kiểm tra pháp lý chi tiết giúp bạn đầu tư an toàn và yên tâm
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">ROI chính xác</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tính toán lợi nhuận đầu tư dựa trên dữ liệu thị trường thực tế
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom CTA */}
      <Card className="border-0 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-primary/5 p-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex p-3 bg-primary rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-black text-foreground">
              Bắt đầu phân tích ngay hôm nay
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Truy cập đầy đủ công cụ phân tích và so sánh dự án bất động sản với công nghệ AI
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Button 
                size="lg" 
                onClick={() => navigate('/market-overview')}
                className="rounded-xl px-8 h-14 text-base font-semibold shadow-xl"
              >
                Khám phá ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="rounded-xl px-8 h-14 text-base font-semibold border-2 hover:bg-primary/5"
              >
                Đăng ký miễn phí
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="PropertyHub - Nền tảng thông tin bất động sản Việt Nam"
          description={`Khám phá ${projectsData.length} dự án bất động sản. So sánh giá và tìm cơ hội đầu tư tốt nhất.`}
          keywords="bất động sản, dự án, đầu tư, mua nhà, chung cư"
          schema={combinedSchema}
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
        title="PropertyHub - Nền tảng thông tin bất động sản Việt Nam"
        description={`Khám phá ${projectsData.length} dự án bất động sản. So sánh giá và tìm cơ hội đầu tư tốt nhất.`}
        keywords="bất động sản, dự án, đầu tư, mua nhà, chung cư"
        schema={combinedSchema}
      />
      <DesktopLayout showHeader={true}>
        {content}
      </DesktopLayout>
    </>
  );
};

export default Home;