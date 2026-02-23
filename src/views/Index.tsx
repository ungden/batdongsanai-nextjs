"use client";
import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation';

import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DesktopLayout from "@/components/layout/DesktopLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Search, TrendingUp, ArrowRight, Building2, Sparkles, MapPin, Shield, Star, Award, BarChart3 } from "lucide-react";
import { projectsData } from "@/data/projectsData";
import CompactProjectCard from "@/components/home/CompactProjectCard";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import ProjectColumns from "@/components/home/ProjectColumns";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Home = () => {
  const navigate = useRouter();
  const { trackEvent } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredProjects = useMemo(() => {
    return projectsData
      .filter(project => project.legalScore >= 8)
      .slice(0, 8);
  }, []);

  const stats = useMemo(() => {
    const total = projectsData.length;
    const goodLegal = projectsData.filter(p => p.legalScore >= 8).length;
    const avgLegal = projectsData.reduce((sum, p) => sum + p.legalScore, 0) / total;
    const safetyRate = Math.round((goodLegal / total) * 100);
    
    return { total, goodLegal, avgLegal: avgLegal.toFixed(1), safetyRate };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackEvent({ action: 'search_from_home', category: 'Search', label: searchQuery });
      navigate.push(`/market-overview?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate.push('/market-overview');
    }
  };

  const handleProjectClick = (id: string) => {
    navigate.push(`/projects/${id}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'search':
        navigate.push(`/search${searchQuery ? `?q=${searchQuery}` : ''}`);
        break;
      case 'calculator':
        navigate.push('/calculator');
        break;
      case 'market':
        navigate.push('/market-overview');
        break;
      case 'projects':
        navigate.push('/projects');
        break;
    }
  };

  const content = (
    <div className="space-y-10 pb-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-blue-800 text-white shadow-2xl dark:from-slate-900 dark:to-black border dark:border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent dark:from-background/80"></div>
        
        <div className="relative z-10 px-6 py-16 md:py-24 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Nền tảng AI Bất động sản #1 Việt Nam</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Đầu tư thông minh <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                An toàn pháp lý
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-50/90 max-w-2xl mx-auto leading-relaxed font-light">
              Phân tích chuyên sâu, kiểm tra pháp lý và dự báo giá chính xác cho hơn {projectsData.length}+ dự án bất động sản.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative flex items-center w-full h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
                <div className="grid place-items-center h-full w-14 text-slate-400">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  className="peer h-full w-full outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent"
                  type="text"
                  placeholder="Tìm kiếm dự án, khu vực, chủ đầu tư..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <div className="pr-2">
                  <Button 
                    onClick={handleSearch} 
                    size="lg" 
                    className="h-12 px-8 rounded-xl font-bold bg-primary text-white hover:bg-blue-600 shadow-md transition-all hover:scale-105"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-blue-100/80">
              <span>Gợi ý:</span>
              {['Vinhomes', 'Quận 9', 'Masterise', 'Căn hộ cao cấp'].map(tag => (
                <span 
                  key={tag} 
                  className="cursor-pointer hover:text-white hover:underline transition-colors"
                  onClick={() => { setSearchQuery(tag); handleSearch(); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Semantic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Tổng dự án", value: stats.total, icon: Building2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Pháp lý tốt", value: stats.goodLegal, icon: Shield, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Điểm TB", value: stats.avgLegal, icon: Star, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "An toàn", value: `${stats.safetyRate}%`, icon: Award, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, index) => (
          <Card key={index} className="border-border shadow-sm bg-card hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-foreground mb-1 tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => handleQuickAction('search')}
          className="group relative overflow-hidden rounded-2xl p-6 bg-card border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Tìm kiếm thông minh</h3>
              <p className="text-muted-foreground text-sm">Lọc theo giá, khu vực & pháp lý</p>
            </div>
            <div className="p-2 rounded-full bg-muted text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleQuickAction('calculator')}
          className="group relative overflow-hidden rounded-2xl p-6 bg-card border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Tính toán đầu tư</h3>
              <p className="text-muted-foreground text-sm">Dự phóng dòng tiền & lợi nhuận</p>
            </div>
            <div className="p-2 rounded-full bg-muted text-muted-foreground group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleQuickAction('market')}
          className="group relative overflow-hidden rounded-2xl p-6 bg-card border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Dữ liệu thị trường</h3>
              <p className="text-muted-foreground text-sm">Biểu đồ giá & xu hướng</p>
            </div>
            <div className="p-2 rounded-full bg-muted text-muted-foreground group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dự án nổi bật</h2>
            <p className="text-muted-foreground">Các dự án có pháp lý tốt và tiềm năng tăng giá</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => handleQuickAction('projects')}
            className="text-primary hover:bg-primary/10 font-semibold"
          >
            Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
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
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="Realprofit.vn - Nền tảng đầu tư BĐS thông minh"
          description="Phân tích pháp lý, tính toán ROI và khám phá cơ hội đầu tư bất động sản tốt nhất tại Việt Nam"
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
        title="Realprofit.vn - Nền tảng đầu tư BĐS thông minh"
        description="Phân tích pháp lý, tính toán ROI và khám phá cơ hội đầu tư bất động sản tốt nhất tại Việt Nam"
      />
      <DesktopLayout 
        title="Chào mừng đến Realprofit.vn" 
        subtitle="Nền tảng đầu tư BĐS thông minh"
        showHeader={false} // Hide default header to use custom hero
      >
        {content}
      </DesktopLayout>
    </>
  );
};

export default Home;