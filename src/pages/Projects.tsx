import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import EnhancedProjectCard from "@/components/project/EnhancedProjectCard";
import ProjectGridCard from "@/components/project/ProjectGridCard";
import BannerAd from "@/components/ads/BannerAd";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProjects } from "@/hooks/useProjects";
import { ANALYTICS_CONFIG, isAdsEnabled } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SortAsc, MapPin, DollarSign, Loader2, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Projects = () => {
  const navigate = useNavigate();
  const { trackProjectView } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
  const { projects, loading } = useProjects();
  
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
    priceRange: "all",
    sortBy: "newest"
  });

  const handleProjectClick = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      trackProjectView(id, project.name);
    }
    navigate(`/projects/${id}`);
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.developer.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(project => 
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceRange !== "all") {
      if (filters.priceRange === "under-50") {
        filtered = filtered.filter(p => p.pricePerSqm < 50000000);
      } else if (filters.priceRange === "50-100") {
        filtered = filtered.filter(p => p.pricePerSqm >= 50000000 && p.pricePerSqm < 100000000);
      } else if (filters.priceRange === "over-100") {
        filtered = filtered.filter(p => p.pricePerSqm >= 100000000);
      }
    }

    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.pricePerSqm - b.pricePerSqm);
        break;
      case "price-high":
        filtered.sort((a, b) => b.pricePerSqm - a.pricePerSqm);
        break;
      case "legal-score":
        filtered.sort((a, b) => b.legalScore - a.legalScore);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => {
            const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
            const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
            return dateB - dateA;
        });
    }

    return filtered;
  }, [filters, projects]);

  if (loading) {
    return (
      <DesktopLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DesktopLayout>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900">Danh sách dự án</h1>
            <Badge variant="secondary" className="text-xs font-medium bg-slate-100 text-slate-600">
              {filteredProjects.length} kết quả
            </Badge>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm dự án, địa điểm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {/* Mobile Filters - simplified for better UX */}
            <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
              <SelectTrigger className="w-auto min-w-[100px] h-9 rounded-full bg-white border-slate-200 text-xs font-medium">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ho chi minh">TP. HCM</SelectItem>
                <SelectItem value="ha noi">Hà Nội</SelectItem>
                <SelectItem value="da nang">Đà Nẵng</SelectItem>
                <SelectItem value="binh duong">Bình Dương</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
              <SelectTrigger className="w-auto min-w-[100px] h-9 rounded-full bg-white border-slate-200 text-xs font-medium">
                <SelectValue placeholder="Mức giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="under-50">&lt; 50tr/m²</SelectItem>
                <SelectItem value="50-100">50-100tr/m²</SelectItem>
                <SelectItem value="over-100">&gt; 100tr/m²</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isAdsEnabled() && (
          <BannerAd
            adClient={ANALYTICS_CONFIG.ADSENSE_CLIENT_ID}
            adSlot={ANALYTICS_CONFIG.AD_SLOTS.HEADER_BANNER}
            className="px-3 pt-2"
          />
        )}

        <div className="p-4 space-y-4">
          {filteredProjects.map((project, index) => (
            <div key={project.id}>
              <EnhancedProjectCard
                project={project}
                onClick={handleProjectClick}
              />
              {isAdsEnabled() && (index + 1) % 3 === 0 && (
                <BannerAd
                  adClient={ANALYTICS_CONFIG.ADSENSE_CLIENT_ID}
                  adSlot={ANALYTICS_CONFIG.AD_SLOTS.CONTENT_BANNER}
                  className="my-3 w-full"
                />
              )}
            </div>
          ))}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      title="Danh sách dự án"
      subtitle={`${filteredProjects.length} dự án đang mở bán`}
    >
      <div className="space-y-6">
        {/* Filter Bar - Clean Card Design */}
        <Card className="border-none shadow-sm bg-white rounded-2xl sticky top-20 z-10">
          <div className="p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-11 text-sm bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <SelectValue placeholder="Khu vực" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  <SelectItem value="ho chi minh">TP. Hồ Chí Minh</SelectItem>
                  <SelectItem value="ha noi">Hà Nội</SelectItem>
                  <SelectItem value="da nang">Đà Nẵng</SelectItem>
                  <SelectItem value="binh duong">Bình Dương</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                   <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <SelectValue placeholder="Mức giá" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức giá</SelectItem>
                  <SelectItem value="under-50">Dưới 50 triệu/m²</SelectItem>
                  <SelectItem value="50-100">50-100 triệu/m²</SelectItem>
                  <SelectItem value="over-100">Trên 100 triệu/m²</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger className="w-[160px] h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                   <div className="flex items-center gap-2 text-slate-600">
                    <SortAsc className="w-4 h-4" />
                    <SelectValue placeholder="Sắp xếp" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="price-low">Giá thấp - cao</SelectItem>
                  <SelectItem value="price-high">Giá cao - thấp</SelectItem>
                  <SelectItem value="legal-score">Điểm pháp lý</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 pb-10">
          {filteredProjects.map((project) => (
            <ProjectGridCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <Filter className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy dự án</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
            </p>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
};

export default Projects;