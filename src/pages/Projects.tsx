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
import { Search, SortAsc, MapPin, DollarSign, Loader2 } from "lucide-react";
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

  const goodLegalProjects = filteredProjects.filter(p => p.status === "good").length;

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
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Danh sách dự án</h1>
            <Badge variant="secondary" className="text-xs">
              {filteredProjects.length} kết quả
            </Badge>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm dự án, địa điểm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-10 rounded-xl bg-background border-border"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-secondary text-xs border-0">
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
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-secondary text-xs border-0">
                <SelectValue placeholder="Mức giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="under-50">&lt; 50tr/m²</SelectItem>
                <SelectItem value="50-100">50-100tr/m²</SelectItem>
                <SelectItem value="over-100">&gt; 100tr/m²</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-secondary text-xs border-0">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-low">Giá thấp</SelectItem>
                <SelectItem value="price-high">Giá cao</SelectItem>
                <SelectItem value="legal-score">Pháp lý</SelectItem>
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
        {/* Filter Bar */}
        <Card className="border border-border shadow-sm bg-card">
          <div className="p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 h-10 text-sm bg-background"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  <SelectItem value="ho chi minh">TP. Hồ Chí Minh</SelectItem>
                  <SelectItem value="ha noi">Hà Nội</SelectItem>
                  <SelectItem value="da nang">Đà Nẵng</SelectItem>
                  <SelectItem value="binh duong">Bình Dương</SelectItem>
                  <SelectItem value="dong nai">Đồng Nai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Mức giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức giá</SelectItem>
                  <SelectItem value="under-50">Dưới 50 triệu/m²</SelectItem>
                  <SelectItem value="50-100">50-100 triệu/m²</SelectItem>
                  <SelectItem value="over-100">Trên 100 triệu/m²</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Sắp xếp" />
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
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectGridCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Không tìm thấy dự án</h3>
            <p className="text-muted-foreground text-sm mt-1">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
};

export default Projects;