"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DesktopLayout from "@/components/layout/DesktopLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Search, ArrowRight, Building2, Sparkles, Shield, Star, Award, BarChart3, TrendingUp } from "lucide-react";
import { projectsData } from "@/data/projectsData";
import CompactProjectCard from "@/components/home/CompactProjectCard";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import ProjectColumns from "@/components/home/ProjectColumns";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Home = () => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackEvent({ action: 'search_from_home', category: 'Search', label: searchQuery });
      navigate(`/market-overview?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/market-overview');
    }
  };

  const handleProjectClick = (id: string) => {
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
    <div className="space-y-8 pb-20">
      {/* Hero Section - More compact and refined */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl isolate">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 opacity-95" />
        </div>
        
        <div className="relative z-10 px-6 py-12 md:py-20 text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-100 text-xs font-medium shadow-sm animate-fade-in">
            <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>Nền tảng AI Bất động sản #1 Việt Nam</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
            Đầu tư thông minh <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
              An toàn pháp lý
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed font-light">
            Phân tích chuyên sâu, kiểm tra pháp lý và dự báo giá chính xác cho hơn <span className="text-white font-semibold">{stats.total}+</span> dự án.
          </p>

          {/* Compact Search Bar */}
          <div className="max-w-xl mx-auto mt-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center w-full h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg overflow-hidden pl-5 pr-1.5">
                <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <input
                  className="peer h-full w-full outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent"
                  type="text"
                  placeholder="Tìm dự án, khu vực..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  size="sm" 
                  className="h-9 px-6 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105 shrink-0 text-sm"
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
            
            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4 text-xs text-slate-400">
              <span className="opacity-70">Gợi ý:</span>
              {['Vinhomes', 'Masterise', 'Thủ Thiêm', 'Quận 9'].map(tag => (
                <span 
                  key={tag} 
                  className="cursor-pointer text-slate-300 hover:text-white hover:underline transition-colors"
                  onClick={() => { setSearchQuery(tag); handleSearch(); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Smaller & Tighter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-6 relative z-20 px-4 max-w-5xl mx-auto">
        {[
          { label: "Dự án theo dõi", value: stats.total, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-slate-800" },
          { label: "Pháp lý an toàn", value: stats.goodLegal, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-slate-800" },
          { label: "Điểm pháp lý TB", value: stats.avgLegal, icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-slate-800" },
          { label: "Tỷ lệ an toàn", value: `${stats.safetyRate}%`, icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-slate-800" },
        ].map((stat, index) => (
          <Card key={index} className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm ${stat.bg}`}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <stat.icon className={`w-5 h-5 mb-1.5 ${stat.color} stroke-[1.5px]`} />
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tools Section */}
      <div className="px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary stroke-[1.5px]" />
            Công cụ đầu tư
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => handleQuickAction('search')}
              className="group relative overflow-hidden rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 stroke-[1.5px]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tìm kiếm thông minh</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">Lọc dự án theo khoảng giá, khu vực, pháp lý và chủ đầu tư uy tín.</p>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Khám phá ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('calculator')}
              className="group relative overflow-hidden rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 stroke-[1.5px]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tính toán dòng tiền</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">Dự phóng lợi nhuận, tính lịch trả nợ và phân tích hiệu quả đầu tư.</p>
                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Tính ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleQuickAction('market')}
              className="group relative overflow-hidden rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 stroke-[1.5px]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Dữ liệu thị trường</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">Biểu đồ giá, xu hướng tăng trưởng và phân tích vĩ mô.</p>
                <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Xem dữ liệu <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="px-4 bg-slate-50 dark:bg-transparent py-12 -mb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Dự án nổi bật</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Các dự án có pháp lý tốt và tiềm năng tăng giá cao nhất</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => handleQuickAction('projects')}
              className="text-primary hover:bg-primary/10 font-semibold text-sm"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
          
          {isMobile ? (
            <div className="grid grid-cols-1 gap-4">
              {featuredProjects.slice(0, 4).map((project) => (
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
          {content}
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