import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Map as MapIcon, List, SortAsc, MapPin, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import ProjectCard from "@/components/project/ProjectCard";
import GoogleMapViewer from "@/components/map/GoogleMapViewer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { projectsData } from "@/data/projectsData";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

const Explore = () => {
  const navigate = useNavigate();
  const { trackSearch, trackProjectView } = useAnalytics(ANALYTICS_CONFIG.GA_TRACKING_ID);
  const isMobile = useIsMobile();
  
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState({
    search: "",
    location: "all",
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

  const filteredProjects = useMemo(() => {
    let filtered = projectsData;

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
      default:
        filtered.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
    }

    return filtered;
  }, [filters]);

  const content = (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search & Filter Bar */}
      <Card className="border-none shadow-sm bg-background/95 backdrop-blur sticky top-0 z-30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + View Toggle */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm dự án, địa điểm..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all"
                />
              </div>
              
              <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
                <ToggleGroupItem value="list" aria-label="List View">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="map" aria-label="Map View">
                  <MapIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Bottom Row: Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Select value={filters.location} onValueChange={(v) => setFilters(prev => ({ ...prev, location: v }))}>
                <SelectTrigger className="w-auto min-w-[130px] h-9 rounded-full border-dashed">
                  <MapPin className="w-3.5 h-3.5 mr-2" />
                  <SelectValue placeholder="Khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  <SelectItem value="ho chi minh">TP. HCM</SelectItem>
                  <SelectItem value="ha noi">Hà Nội</SelectItem>
                  <SelectItem value="da nang">Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priceRange} onValueChange={(v) => setFilters(prev => ({ ...prev, priceRange: v }))}>
                <SelectTrigger className="w-auto min-w-[130px] h-9 rounded-full border-dashed">
                  <DollarSign className="w-3.5 h-3.5 mr-2" />
                  <SelectValue placeholder="Mức giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả giá</SelectItem>
                  <SelectItem value="under-50">&lt; 50tr/m²</SelectItem>
                  <SelectItem value="50-100">50-100tr/m²</SelectItem>
                  <SelectItem value="over-100">&gt; 100tr/m²</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(v) => setFilters(prev => ({ ...prev, sortBy: v }))}>
                <SelectTrigger className="w-auto min-w-[130px] h-9 rounded-full border-dashed">
                  <SortAsc className="w-3.5 h-3.5 mr-2" />
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
        </CardContent>
      </Card>

      {/* Content Area */}
      <div className="flex-1 relative min-h-[calc(100vh-200px)]">
        {/* Result Count */}
        <div className="px-4 mb-2 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Tìm thấy <strong>{filteredProjects.length}</strong> dự án
          </p>
        </div>

        {viewMode === "map" ? (
          <div className="h-full w-full min-h-[500px] rounded-xl overflow-hidden border border-border">
            <GoogleMapViewer projects={filteredProjects} className="w-full h-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-20">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Không tìm thấy dự án nào phù hợp.
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="animate-fade-in">
                  <ProjectCard
                    project={project}
                    onClick={handleProjectClick}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {content}
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="Khám phá" subtitle="Tìm kiếm dự án thông minh">
      {content}
    </DesktopLayout>
  );
};

export default Explore;