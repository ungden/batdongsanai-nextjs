"use client";

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import ProjectGridCard from "@/components/project/ProjectGridCard";
import SEOHead from "@/components/seo/SEOHead";
import MarketTabs from "@/components/market/MarketTabs";
import QuickFilters from "@/components/market/QuickFilters";
import FilterTags from "@/components/market/FilterTags";
import MarketStatsCard from "@/components/market/MarketStatsCard";
import PriceChangeIndicator from "@/components/market/PriceChangeIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { projectsData } from "@/data/projectsData";
import { getProjectPhase } from "@/utils/projectPhases";
import { 
  Search, Download, Building2, MapPin, 
  Eye, Home, Building, Store, Landmark,
  ChevronUp, ChevronDown, TrendingUp, Grid, List
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FilterTag {
  id: string;
  label: string;
  category: string;
}

const MarketOverview = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState<FilterTag[]>([]);
  const [sortBy, setSortBy] = useState("pricePerSqm");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} tr`;
    }
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Quick filters definition
  const quickFilters = [
    { id: "apartment", label: "Chung cư", icon: <Building2 className="w-3.5 h-3.5" />, count: 45 },
    { id: "villa", label: "Biệt thự", icon: <Home className="w-3.5 h-3.5" />, count: 23 },
    { id: "townhouse", label: "Nhà phố", icon: <Building className="w-3.5 h-3.5" />, count: 18 },
    { id: "shophouse", label: "Shophouse", icon: <Store className="w-3.5 h-3.5" />, count: 12 },
    { id: "land", label: "Đất nền", icon: <Landmark className="w-3.5 h-3.5" />, count: 8 },
  ];

  const handleToggleQuickFilter = (filterId: string) => {
    setSelectedQuickFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleRemoveFilterTag = (tagId: string) => {
    setSelectedFilterTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const handleClearAllFilters = () => {
    setSelectedFilterTags([]);
    setSelectedQuickFilters([]);
    setSearchQuery("");
  };

  // Enrich projects with phase data for filtering
  const enrichedProjects = useMemo(() => {
    return projectsData.map(p => ({
      ...p,
      phase: getProjectPhase(p).phase
    }));
  }, []);

  // Filter projects based on active tab and phase
  const filteredProjects = useMemo(() => {
    let filtered = enrichedProjects;

    // Filter by Phase Tab
    if (activeTab !== "all" && activeTab !== "stats") {
      filtered = filtered.filter(p => p.phase === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.developer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "pricePerSqm":
          aValue = a.pricePerSqm;
          bValue = b.pricePerSqm;
          break;
        case "legalScore":
          aValue = a.legalScore;
          bValue = b.legalScore;
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "desc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      
      return sortOrder === "desc" ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
    });
  }, [activeTab, searchQuery, sortBy, sortOrder, enrichedProjects]);

  // Calculate counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: enrichedProjects.length,
      selling: enrichedProjects.filter(p => p.phase === "selling").length,
      secondary: enrichedProjects.filter(p => p.phase === "secondary").length,
      upcoming: enrichedProjects.filter(p => p.phase === "upcoming").length,
    };
  }, [enrichedProjects]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "good": return "success";
      case "warning": return "warning";
      case "danger": return "danger";
      default: return "neutral";
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Thị trường</h1>
          <MarketTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              counts={tabCounts}
          />
          
          {activeTab === "stats" ? (
            <MarketStatsCard projects={projectsData} />
          ) : (
            <div className="space-y-4 mt-4">
              {filteredProjects.map((project) => (
                <div key={project.id} className="animate-fade-in">
                   <ProjectGridCard 
                    project={project} 
                    onClick={() => navigate(`/projects/${project.id}`)} 
                  />
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Không có dự án nào</div>
              )}
            </div>
          )}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      <SEOHead
        title="Tổng quan thị trường BĐS - PropertyHub"
        description={`Khám phá ${filteredProjects.length} dự án bất động sản. So sánh giá và tìm cơ hội đầu tư tốt nhất.`}
        keywords="thị trường bất động sản, dự án, giá nhà, đầu tư, listing"
      />
      <DesktopLayout title="Tổng quan thị trường" subtitle={`${filteredProjects.length} dự án`}>
        <div className="space-y-6">
          {/* Search and Tabs */}
          <Card className="border-none shadow-sm bg-card rounded-xl">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm bg-muted/50 border-transparent focus:bg-background focus:border-primary rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)} className="border rounded-lg p-1 bg-muted/30">
                      <ToggleGroupItem value="grid" size="sm" className="h-8 w-8 p-0"><Grid className="h-4 w-4" /></ToggleGroupItem>
                      <ToggleGroupItem value="table" size="sm" className="h-8 w-8 p-0"><List className="h-4 w-4" /></ToggleGroupItem>
                   </ToggleGroup>
                   <Button variant="outline" size="sm" className="h-10 rounded-lg border-border text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4 mr-2" /> Xuất báo cáo
                   </Button>
                </div>
              </div>

              <MarketTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                counts={tabCounts}
              />

              {activeTab !== "stats" && (
                <div className="pt-3 border-t border-border">
                  <QuickFilters
                    filters={quickFilters}
                    selectedFilters={selectedQuickFilters}
                    onToggleFilter={handleToggleQuickFilter}
                  />

                  <FilterTags
                    selectedTags={selectedFilterTags}
                    onRemoveTag={handleRemoveFilterTag}
                    onClearAll={handleClearAllFilters}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Stats View */}
          {activeTab === "stats" ? (
            <MarketStatsCard projects={projectsData} />
          ) : (
            <>
               {/* Grid View */}
               {viewMode === "grid" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredProjects.map((project) => (
                     <div key={project.id} className="animate-fade-in">
                        <ProjectGridCard 
                          project={project} 
                          onClick={() => navigate(`/projects/${project.id}`)} 
                        />
                     </div>
                   ))}
                 </div>
               )}

               {/* Table View */}
               {viewMode === "table" && (
                <Card className="border-none shadow-sm bg-card rounded-xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                            <TableHead className="font-bold text-xs py-3 pl-4 text-muted-foreground uppercase tracking-wider">Dự án</TableHead>
                            <TableHead className="font-bold text-xs py-3 text-muted-foreground uppercase tracking-wider">Giai đoạn</TableHead>
                            <TableHead className="text-right font-bold text-xs py-3 text-muted-foreground uppercase tracking-wider">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSortBy("pricePerSqm");
                                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                                }}
                                className="h-auto p-0 hover:bg-transparent font-bold text-xs text-muted-foreground uppercase tracking-wider"
                              >
                                Giá/m²
                                {sortBy === "pricePerSqm" && (
                                  sortOrder === "desc" ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />
                                )}
                              </Button>
                            </TableHead>
                            <TableHead className="text-right font-bold text-xs py-3 text-muted-foreground uppercase tracking-wider">Biến động</TableHead>
                            <TableHead className="text-center font-bold text-xs py-3 text-muted-foreground uppercase tracking-wider">Đã bán</TableHead>
                            <TableHead className="text-center font-bold text-xs py-3 text-muted-foreground uppercase tracking-wider">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSortBy("legalScore");
                                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                                }}
                                className="h-auto p-0 hover:bg-transparent font-bold text-xs text-muted-foreground uppercase tracking-wider"
                              >
                                Pháp lý
                                {sortBy === "legalScore" && (
                                  sortOrder === "desc" ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />
                                )}
                              </Button>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProjects.map((project) => {
                            const soldPct = project.totalUnits && project.soldUnits ?
                              Math.round((project.soldUnits / project.totalUnits) * 100) : 0;
                            const { label: phaseLabel, color: phaseColor } = getProjectPhase(project);
                            
                            return (
                              <TableRow 
                                key={project.id}
                                className="cursor-pointer hover:bg-muted/30 transition-colors group border-b border-border last:border-0 h-14"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                <TableCell className="py-2 pl-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-border rounded-lg">
                                      <AvatarImage src={project.image} alt={project.name} className="object-cover" />
                                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary rounded-lg">
                                        {project.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate max-w-[180px]">
                                        {project.name}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                                        {project.developer}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell className="py-2">
                                  <Badge className={`${phaseColor} border-0 font-medium text-[10px] whitespace-nowrap`}>
                                    {phaseLabel}
                                  </Badge>
                                </TableCell>
                                
                                <TableCell className="text-right py-2">
                                  <div className="font-bold text-primary text-sm">
                                    {formatPrice(project.pricePerSqm)}
                                  </div>
                                </TableCell>

                                <TableCell className="text-right py-2">
                                  {project.launchPrice && project.currentPrice ? (
                                    <PriceChangeIndicator
                                      currentPrice={project.currentPrice}
                                      launchPrice={project.launchPrice}
                                      showIcon={false}
                                      className="text-xs justify-end"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>

                                <TableCell className="text-center py-2">
                                  {soldPct > 0 ? (
                                    <div className="space-y-1">
                                      <div className="font-bold text-xs text-foreground">{soldPct}%</div>
                                      <Progress value={soldPct} className="h-1 w-12 mx-auto bg-muted" />
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                                
                                <TableCell className="text-center py-2">
                                  <StatusBadge variant={getStatusVariant(project.status)} className="font-semibold text-[10px] px-2 py-0.5 rounded-full border-0 h-5">
                                    {project.legalScore}/10
                                  </StatusBadge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
               )}
            </>
          )}
        </div>
      </DesktopLayout>
    </>
  );
};

export default MarketOverview;