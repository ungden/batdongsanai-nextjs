"use client";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DesktopLayout from "@/components/layout/DesktopLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Search, TrendingUp, ArrowRight, Building2, Sparkles, MapPin } from "lucide-react";
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
      trackEvent({ action: 'search_from_home', category: 'Search', label: searchQuery });
      navigate(`/market-overview?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/market-overview');
    }
  };

  const handleProjectClick = (id: string) => {
    navigate(`/projects/${id}`);
  };

  return (
    <DesktopLayout showHeader={true}>
      <SEOHead
        title="PropertyHub - Nền tảng thông tin bất động sản Việt Nam"
        description="Khám phá dự án bất động sản, so sánh giá và tìm cơ hội đầu tư tốt nhất."
      />
      
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Modern Clean Hero Section */}
        <section className="relative bg-card rounded-3xl border border-border shadow-sm overflow-hidden p-8 md:p-16 text-center transition-colors">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-80" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Đầu tư bất động sản <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Thông minh & An toàn
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Dữ liệu pháp lý minh bạch, lịch sử giá thực tế và phân tích AI chuyên sâu cho hơn {projectsData.length}+ dự án.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center w-full h-14 rounded-xl bg-background border border-border shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <div className="grid place-items-center h-full w-12 text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  className="peer h-full w-full outline-none text-sm text-foreground bg-transparent placeholder:text-muted-foreground/70"
                  type="text"
                  id="search"
                  placeholder="Tìm dự án, khu vực, chủ đầu tư..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <div className="pr-2">
                  <Button onClick={handleSearch} size="sm" className="h-9 px-5 rounded-lg font-medium shadow-none">
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{projectsData.length}</span> dự án
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-foreground">AI</span> phân tích
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Cập nhật hàng ngày
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Thị trường", desc: "Xu hướng & giá cả", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", link: "/market-overview" },
            { title: "Bản đồ pháp lý", desc: "Kiểm tra an toàn", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", link: "/legal-matrix" },
            { title: "Chợ BĐS", desc: "Mua bán & Cho thuê", icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/marketplace" },
          ].map((item, idx) => (
            <Card 
              key={idx} 
              className="card-modern cursor-pointer hover:border-primary/50 group bg-card"
              onClick={() => navigate(item.link)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dự án nổi bật</h2>
              <p className="text-muted-foreground text-sm mt-1">Các dự án có điểm pháp lý cao và tiềm năng tốt</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/projects')} className="text-primary hover:text-primary/80 hover:bg-primary/10">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((project) => (
              <CompactProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        </section>

        {/* Locations */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Khám phá theo khu vực</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương"].map((city) => (
              <div 
                key={city}
                onClick={() => navigate(`/market-overview?location=${encodeURIComponent(city)}`)}
                className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer border border-border"
              >
                <div className="absolute inset-0 bg-card group-hover:bg-accent transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="p-2 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{city}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DesktopLayout>
  );
};

export default Home;