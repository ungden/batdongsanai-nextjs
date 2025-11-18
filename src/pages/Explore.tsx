import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SortAsc, MapPin, Building2, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import ProjectCard from "@/components/project/ProjectCard";
import BannerAd from "@/components/ads/BannerAd";
import { useAnalytics } from "@/hooks/useAnalytics";
import { projectsData } from "@/data/projectsData";
import { ANALYTICS_CONFIG, isAdsEnabled } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

const Explore = () => {
  const navigate = useNavigate();
  const { trackSearch, trackProjectView } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    priceRange: "all",
    sortBy: "newest"
  });

  const handleProjectClick = (id: string) => {
    const project = projectsData.find(p => p.id === id);
    if (project) {
      trackProjectView(id, project.name);
    }
    navigate(`/projects/${id}`);
  };

  const handleSearch = () => {
    if (filters.search) {
      trackSearch(filters.search, filteredProjects.length);
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = projectsData;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.developer.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(project => 
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filter
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "under-50") {
        filtered = filtered.filter(p => p.pricePerSqm < 50000000);
      } else if (filters.priceRange === "50-100") {
        filtered = filtered.filter(p => p.pricePerSqm >= 50000000 && p.pricePerSqm < 100000000);
      } else if (filters.priceRange === "over-100") {
        filtered = filtered.filter(p => p.pricePerSqm >= 100000000);
      }
    }

    // Sort
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
      default: // newest
        filtered.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
    }

    return filtered;
  }, [filters]);

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Enhanced Search Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-b border-border/50 p-6 shadow-sm">
          <div className="layout-modern">
            <h1 className="text-headline-2 mb-4">Khám phá dự án</h1>
            
            {/* Advanced Search */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Tìm dự án, chủ đầu tư, địa điểm..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-12 rounded-xl border-border/50 focus:border-primary/50"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="h-12 px-6 rounded-xl"
              >
                Tìm
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger className="w-auto min-w-[120px] h-9 rounded-full">
                  <MapPin className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  <SelectItem value="ho chi minh">TP. HCM</SelectItem>
                  <SelectItem value="ha noi">Hà Nội</SelectItem>
                  <SelectItem value="da nang">Đà Nẵng</SelectItem>
                  <SelectItem value="binh duong">Bình Dương</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger className="w-auto min-w-[120px] h-9 rounded-full">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Mức giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả giá</SelectItem>
                  <SelectItem value="under-50">&lt; 50tr/m²</SelectItem>
                  <SelectItem value="50-100">50-100tr/m²</SelectItem>
                  <SelectItem value="over-100">&gt; 100tr/m²</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger className="w-auto min-w-[120px] h-9 rounded-full">
                  <SortAsc className="w-4 h-4 mr-1" />
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
        </div>

        {/* Banner Ad */}
        {isAdsEnabled() && (
          <BannerAd
            adClient={ANALYTICS_CONFIG.ADSENSE_CLIENT_ID}
            adSlot={ANALYTICS_CONFIG.AD_SLOTS.HEADER_BANNER}
            className="px-4 pt-4"
          />
        )}

        <div className="layout-modern pt-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-headline-3">
                Kết quả tìm kiếm
                {filters.search && (
                  <span className="text-primary"> cho "{filters.search}"</span>
                )}
              </h2>
              <p className="text-body text-muted-foreground mt-1">
                {filteredProjects.length} dự án được tìm thấy
              </p>
            </div>
            <Badge variant="secondary" className="font-medium">
              {filteredProjects.length}
            </Badge>
          </div>

          {/* Results */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy dự án</h3>
              <p className="text-muted-foreground">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProjects.map((project, index) => (
                <div key={project.id}>
                  <div className="interactive-hover">
                    <ProjectCard
                      project={project}
                      onClick={handleProjectClick}
                    />
                  </div>
                  {/* Banner ad every 4 results */}
                  {isAdsEnabled() && (index + 1) % 4 === 0 && (
                    <BannerAd
                      adClient={ANALYTICS_CONFIG.ADSENSE_CLIENT_ID}
                      adSlot={ANALYTICS_CONFIG.AD_SLOTS.CONTENT_BANNER}
                      className="my-4"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      title="Khám phá dự án"
      subtitle={`${filteredProjects.length} dự án được tìm thấy`}
    >
      <div className="p-8 space-y-6">
        {/* Enhanced Search and Filter Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[200px]">
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
                    <SelectTrigger className="w-[160px]">
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
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="interactive-hover">
              <ProjectCard
                project={project}
                onClick={handleProjectClick}
              />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy dự án nào phù hợp.</p>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
};

export default Explore;