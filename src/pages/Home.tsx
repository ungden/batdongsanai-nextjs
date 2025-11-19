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
        {/* Compact Hero Section */}
        <section className="relative bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden p-8 md:p-12 text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Tìm kiếm cơ hội đầu tư <span className="text-primary">thông minh</span>
              </h1>
              <p className="text-lg text-slate-500">
                Dữ liệu pháp lý, lịch sử giá và phân tích AI cho {projectsData.length}+ dự án BĐS.
              </p>
            </div>

            {/* Modern Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative flex items-center w-full h-14 rounded-xl focus-within:shadow-lg bg-slate-50 border border-slate-200 overflow-hidden transition-shadow duration-200">
                <div className="grid place-items-center h-full w-12 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  className="peer h-full w-full outline-none text-sm text-slate-700 pr-2 bg-transparent placeholder:text-slate-400"
                  type="text"
                  id="search"
                  placeholder="Nhập tên dự án, khu vực, chủ đầu tư..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <div className="pr-2">
                  <Button onClick={handleSearch} size="sm" className="h-9 px-4 rounded-lg font-medium">
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-slate-900">{projectsData.length}</span> dự án
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-900">AI</span> phân tích
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Cập nhật hàng ngày
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Thị trường", desc: "Xu hướng & giá cả", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", link: "/market-overview" },
            { title: "Bản đồ pháp lý", desc: "Kiểm tra an toàn", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", link: "/legal-matrix" },
            { title: "Chợ BĐS", desc: "Mua bán & Cho thuê", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", link: "/marketplace" },
          ].map((item, idx) => (
            <Card 
              key={idx} 
              className="card-modern cursor-pointer hover:border-primary/30 group"
              onClick={() => navigate(item.link)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dự án nổi bật</h2>
              <p className="text-slate-500 text-sm mt-1">Các dự án có điểm pháp lý cao và tiềm năng tốt</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/projects')} className="text-primary hover:text-primary/80 hover:bg-primary/5">
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
          <h2 className="text-xl font-bold text-slate-900 mb-4">Khám phá theo khu vực</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương"].map((city) => (
              <div 
                key={city}
                onClick={() => navigate(`/market-overview?location=${encodeURIComponent(city)}`)}
                className="group relative h-24 rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-slate-800 group-hover:bg-primary/90 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MapPin className="w-4 h-4" />
                    {city}
                  </div>
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