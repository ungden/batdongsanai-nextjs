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
import ProjectCard from "@/components/project/ProjectCard";
import SEOHead from "@/components/seo/SEOHead";
import MarketTabs from "@/components/market/MarketTabs";
import QuickFilters from "@/components/market/QuickFilters";
import FilterTags from "@/components/market/FilterTags";
import MarketStatsCard from "@/components/market/MarketStatsCard";
import PriceChangeIndicator from "@/components/market/PriceChangeIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { projectsData } from "@/data/projectsData";
import { 
  Search, Download, Building2, MapPin, 
  Eye, Home, Building, Store, Landmark,
  ChevronUp, ChevronDown
} from "lucide-react";

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

  // Filter projects based on active tab
  const filteredProjects = useMemo(() => {
    let filtered = projectsData;

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter(p => p.completionDate !== "Đã hoàn thành" && p.status === "good");
    } else if (activeTab === "upcoming") {
      filtered = filtered.filter(p => {
        const completionYear = parseInt(p.completionDate.match(/\d{4}/)?.[0] || "0");
        return completionYear > new Date().getFullYear();
      });
    } else if (activeTab === "completed") {
      filtered = filtered.filter(p => p.completionDate === "Đã hoàn thành");
    } else if (activeTab === "premium") {
      filtered = filtered.filter(p => p.legalScore >= 8);
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
  }, [activeTab, searchQuery, sortBy, sortOrder]);

  const tabCounts = {
    all: projectsData.length,
    active: projectsData.filter(p => p.completionDate !== "Đã hoàn thành" && p.status === "good").length,
    upcoming: projectsData.filter(p => {
      const completionYear = parseInt(p.completionDate.match(/\d{4}/)?.[0] || "0");
      return completionYear > new Date().getFullYear();
    }).length,
    completed: projectsData.filter(p => p.completionDate === "Đã hoàn thành").length,
  };

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
      <>
        <SEOHead
          title="Tổng quan thị trường BĐS - PropertyHub"
          description={`Khám phá ${filteredProjects.length} dự án bất động sản. So sánh giá và tìm cơ hội đầu tư tốt nhất.`}
          keywords="thị trường bất động sản, dự án, giá nhà, đầu tư, listing"
        />
        <div className="min-h-screen bg-background pb-20">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-foreground">Thị trường</h1>
                <Badge variant="outline" className="font-semibold text-xs">
                  {filteredProjects.length}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm dự án..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-full text-sm bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all"
                />
              </div>

              <MarketTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                counts={tabCounts}
              />

              {activeTab !== "stats" && (
                <QuickFilters
                  filters={quickFilters}
                  selectedFilters={selectedQuickFilters}
                  onToggleFilter={handleToggleQuickFilter}
                />
              )}
            </div>
          </div>

          <div className="p-3 space-y-3">
            {activeTab === "stats" ? (
              <MarketStatsCard projects={projectsData} />
            ) : (
              <>
                <FilterTags
                  selectedTags={selectedFilterTags}
                  onRemoveTag={handleRemoveFilterTag}
                  onClearAll={handleClearAllFilters}
                />

                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={(id) => navigate(`/projects/${id}`)}
                  />
                ))}

                {filteredProjects.length === 0 && (
                  <Card>
                    <CardContent className="p-10 text-center">
                      <Building2 className="w-14 h-14 mx-auto text-muted-foreground mb-3 opacity-50" />
                      <h3 className="text-base font-semibold mb-1.5">Không tìm thấy dự án</h3>
                      <p className="text-muted-foreground text-sm mb-3">Thử điều chỉnh bộ lọc</p>
                      <Button variant="outline" onClick={handleClearAllFilters} className="rounded-full h-9 text-sm">
                        Xóa bộ lọc
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <BottomNavigation />
        </div>
      </>
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
          <Card className="border border-border/60 shadow-sm bg-card">
            <div className="p-4 space-y-4">
              <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm dự án, chủ đầu tư, khu vực..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-sm bg-background border-input"
                />
              </div>

              <MarketTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                counts={tabCounts}
              />

              {activeTab !== "stats" && (
                <div className="pt-2 border-t border-border/50">
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

          {/* Stats or Table */}
          {activeTab === "stats" ? (
            <MarketStatsCard projects={projectsData} />
          ) : (
            <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                        <TableHead className="font-bold text-sm py-3 pl-6 text-foreground">Dự án</TableHead>
                        <TableHead className="font-bold text-sm py-3 text-foreground">Vị trí</TableHead>
                        <TableHead className="text-right font-bold text-sm py-3 text-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("pricePerSqm");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold"
                          >
                            Giá/m²
                            {sortBy === "pricePerSqm" && (
                              sortOrder === "desc" ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right font-bold text-sm py-3 text-foreground">Tổng giá</TableHead>
                        <TableHead className="text-right font-bold text-sm py-3 text-foreground">Biến động</TableHead>
                        <TableHead className="text-center font-bold text-sm py-3 text-foreground">Đã bán</TableHead>
                        <TableHead className="text-center font-bold text-sm py-3 text-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("legalScore");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold"
                          >
                            Đánh giá
                            {sortBy === "legalScore" && (
                              sortOrder === "desc" ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center font-bold text-sm py-3 pr-6 text-foreground">Bàn giao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => {
                        const soldPct = project.totalUnits && project.soldUnits ?
                          Math.round((project.soldUnits / project.totalUnits) * 100) : 0;
                        
                        return (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-muted/30 transition-colors group border-b border-border/40 last:border-0"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <TableCell className="py-3 pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border border-border">
                                  <AvatarImage src={project.image} alt={project.name} />
                                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                    {project.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                                    {project.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {project.developer}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-sm text-foreground">{project.district}</div>
                                  <div className="text-xs text-muted-foreground">{project.city}</div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right py-3">
                              <div className="font-bold text-primary text-sm">
                                {formatPrice(project.pricePerSqm)}
                              </div>
                              <div className="text-xs text-muted-foreground">VNĐ/m²</div>
                            </TableCell>

                            <TableCell className="text-right py-3">
                              <div className="font-medium text-sm text-foreground">
                                {project.priceRange}
                              </div>
                            </TableCell>

                            <TableCell className="text-right py-3">
                              {project.launchPrice && project.currentPrice ? (
                                <PriceChangeIndicator
                                  currentPrice={project.currentPrice}
                                  launchPrice={project.launchPrice}
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center py-3">
                              {soldPct > 0 ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-sm text-foreground">{soldPct}%</div>
                                  <Progress value={soldPct} className="h-1.5 w-16 mx-auto" />
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-center py-3">
                              <StatusBadge variant={getStatusVariant(project.status)} className="font-semibold text-xs px-2 py-0.5">
                                {project.legalScore}/10
                              </StatusBadge>
                            </TableCell>
                            
                            <TableCell className="text-center pr-6 py-3">
                              <div className="text-sm font-medium text-foreground">{project.completionDate}</div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredProjects.length === 0 && (
                  <div className="p-12 text-center">
                    <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-2 text-foreground">Không tìm thấy dự án</h3>
                    <p className="text-muted-foreground text-sm mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                    <Button variant="outline" onClick={handleClearAllFilters} className="rounded-full h-10 text-sm">
                      Xóa tất cả bộ lọc
                    </Button>
                  </div>
                )}

                {filteredProjects.length > 0 && (
                  <div className="px-6 py-3 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Hiển thị <span className="font-semibold text-foreground">{filteredProjects.length}</span> dự án
                    </span>
                    <Button variant="outline" size="sm" className="h-8 rounded-md text-xs">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Xuất Excel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DesktopLayout>
    </>
  );
};

export default MarketOverview;