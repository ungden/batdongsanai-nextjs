import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import EnhancedProjectCard from "@/components/project/EnhancedProjectCard";
import ProjectGridCard from "@/components/project/ProjectGridCard";
import BannerAd from "@/components/ads/BannerAd";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProjects } from "@/hooks/useProjects"; // Changed import
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
  const { projects, loading } = useProjects(); // Use the hook
  
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
    let filtered = [...projects]; // Create a copy

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
        // Handle potential missing dates safely
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
      <div className="min-h-screen bg-gradient-blue-main pb-20">
        <div className="bg-card border-b p-4">
          <h1 className="text-2xl font-bold text-foreground">Danh sách dự án</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded">{projects.length}</span> dự án đang mở bán
          </p>
        </div>

        <div className="bg-card border-b p-3 sticky top-0 z-10">
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm dự án, địa điểm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-background/80 text-xs">
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
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-background/80 text-xs">
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
              <SelectTrigger className="w-auto min-w-[110px] h-8 rounded-full bg-background/80 text-xs">
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

        <div className="px-3 pt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProjects.length}</span> dự án tìm thấy
            </div>
            <Badge variant="outline" className="text-xs">
              {goodLegalProjects} pháp lý tốt
            </Badge>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="w-full flex justify-center">
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
      <div className="section-spacing">
        <Card className="shadow-blue border-primary/20 card-spacing">
          <div className="form-spacing">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9 h-9 text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger className="w-[150px] h-8 rounded-full text-xs">
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

              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                  <SelectTrigger className="w-[150px] h-8 rounded-full text-xs">
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

              <div className="flex items-center gap-1.5">
                <SortAsc className="w-3.5 h-3.5 text-muted-foreground" />
                <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger className="w-[130px] h-8 rounded-full text-xs">
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
          </div>
        </Card>

        <section className="grid gap-3 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectGridCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </section>

        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Không tìm thấy dự án nào phù hợp.</p>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
};

export default Projects;