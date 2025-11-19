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
  ChevronUp, ChevronDown, TrendingUp
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
        <div className="min-h-screen bg-slate-50 pb-20">
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Thị trường</h1>
                <Badge variant="outline" className="font-semibold text-xs bg-slate-100 text-slate-600 border-slate-200">
                  {filteredProjects.length}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tìm dự án..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-full text-sm bg-slate-50 border-slate-200 focus:bg-white focus:border-primary transition-all"
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
                  <Card className="border-dashed">
                    <CardContent className="p-10 text-center">
                      <Building2 className="w-14 h-14 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-base font-semibold mb-1.5 text-slate-700">Không tìm thấy dự án</h3>
                      <p className="text-slate-500 text-sm mb-3">Thử điều chỉnh bộ lọc</p>
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
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-lg flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm dự án, chủ đầu tư, khu vực..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 text-slate-600">
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
                <div className="pt-4 border-t border-slate-100">
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
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                        <TableHead className="font-bold text-sm py-4 pl-6 text-slate-700">Dự án</TableHead>
                        <TableHead className="font-bold text-sm py-4 text-slate-700">Vị trí</TableHead>
                        <TableHead className="text-right font-bold text-sm py-4 text-slate-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("pricePerSqm");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold text-slate-700"
                          >
                            Giá/m²
                            {sortBy === "pricePerSqm" && (
                              sortOrder === "desc" ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right font-bold text-sm py-4 text-slate-700">Tổng giá</TableHead>
                        <TableHead className="text-right font-bold text-sm py-4 text-slate-700">Biến động</TableHead>
                        <TableHead className="text-center font-bold text-sm py-4 text-slate-700">Đã bán</TableHead>
                        <TableHead className="text-center font-bold text-sm py-4 text-slate-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("legalScore");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold text-slate-700"
                          >
                            Đánh giá
                            {sortBy === "legalScore" && (
                              sortOrder === "desc" ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center font-bold text-sm py-4 pr-6 text-slate-700">Bàn giao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => {
                        const soldPct = project.totalUnits && project.soldUnits ?
                          Math.round((project.soldUnits / project.totalUnits) * 100) : 0;
                        
                        return (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <TableCell className="py-4 pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12 border border-slate-200 rounded-lg">
                                  <AvatarImage src={project.image} alt={project.name} className="object-cover" />
                                  <AvatarFallback className="text-sm font-bold bg-blue-50 text-blue-600 rounded-lg">
                                    {project.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm leading-tight text-slate-900 group-hover:text-primary transition-colors">
                                    {project.name}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {project.developer}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-sm text-slate-700">{project.district}</div>
                                  <div className="text-xs text-slate-500">{project.city}</div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right py-4">
                              <div className="font-bold text-primary text-sm">
                                {formatPrice(project.pricePerSqm)}
                              </div>
                              <div className="text-xs text-slate-500">VNĐ/m²</div>
                            </TableCell>

                            <TableCell className="text-right py-4">
                              <div className="font-medium text-sm text-slate-700">
                                {project.priceRange}
                              </div>
                            </TableCell>

                            <TableCell className="text-right py-4">
                              {project.launchPrice && project.currentPrice ? (
                                <PriceChangeIndicator
                                  currentPrice={project.currentPrice}
                                  launchPrice={project.launchPrice}
                                />
                              ) : (
                                <span className="text-slate-400 text-sm">—</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center py-4">
                              {soldPct > 0 ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-sm text-slate-700">{soldPct}%</div>
                                  <Progress value={soldPct} className="h-1.5 w-16 mx-auto bg-slate-100" />
                                </div>
                              ) : (
                                <span className="text-slate-400 text-sm">—</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-center py-4">
                              <StatusBadge variant={getStatusVariant(project.status)} className="font-bold text-xs px-2.5 py-1 rounded-full border-0">
                                {project.legalScore}/10
                              </StatusBadge>
                            </TableCell>
                            
                            <TableCell className="text-center pr-6 py-4">
                              <div className="text-sm font-medium text-slate-600">{project.completionDate}</div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredProjects.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900">Không tìm thấy dự án</h3>
                    <p className="text-slate-500 text-sm mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                    <Button variant="outline" onClick={handleClearAllFilters} className="rounded-full h-10 px-6 text-sm">
                      Xóa tất cả bộ lọc
                    </Button>
                  </div>
                )}

                {filteredProjects.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Hiển thị <span className="font-semibold text-slate-900">{filteredProjects.length}</span> dự án
                    </span>
                    <Button variant="outline" size="sm" className="h-9 rounded-lg text-xs border-slate-200 text-slate-600 hover:bg-white">
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