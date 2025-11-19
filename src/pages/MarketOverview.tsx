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
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <h1 className="text-2xl font-bold">Tổng quan thị trường</h1>
          
          <MarketStatsCard projects={projectsData} />
          
          <div className="space-y-4">
            <h2 className="font-semibold">Dự án tiêu biểu</h2>
            {filteredProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="animate-fade-in">
                <ProjectCard 
                  project={project} 
                  onClick={() => navigate(`/projects/${project.id}`)} 
                />
              </div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout - Refined
  return (
    <>
      <SEOHead
        title="Tổng quan thị trường BĐS - PropertyHub"
        description={`Khám phá ${filteredProjects.length} dự án bất động sản. So sánh giá và tìm cơ hội đầu tư tốt nhất.`}
        keywords="thị trường bất động sản, dự án, giá nhà, đầu tư, listing"
      />
      <DesktopLayout title="Tổng quan thị trường" subtitle={`${filteredProjects.length} dự án`}>
        <div className="space-y-6">
          {/* Search and Tabs - Compact */}
          <Card className="border-none shadow-sm bg-white rounded-xl">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên dự án, địa điểm, chủ đầu tư..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" className="h-10 rounded-lg border-slate-200 text-slate-600">
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
                <div className="pt-3 border-t border-slate-100">
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
            <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                        <TableHead className="font-bold text-xs py-3 pl-4 text-slate-600 uppercase tracking-wider">Dự án</TableHead>
                        <TableHead className="font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">Vị trí</TableHead>
                        <TableHead className="text-right font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("pricePerSqm");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold text-xs text-slate-600 uppercase tracking-wider"
                          >
                            Giá/m²
                            {sortBy === "pricePerSqm" && (
                              sortOrder === "desc" ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-right font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">Tổng giá</TableHead>
                        <TableHead className="text-right font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">Biến động</TableHead>
                        <TableHead className="text-center font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">Đã bán</TableHead>
                        <TableHead className="text-center font-bold text-xs py-3 text-slate-600 uppercase tracking-wider">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSortBy("legalScore");
                              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                            }}
                            className="h-auto p-0 hover:bg-transparent font-bold text-xs text-slate-600 uppercase tracking-wider"
                          >
                            Pháp lý
                            {sortBy === "legalScore" && (
                              sortOrder === "desc" ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center font-bold text-xs py-3 pr-4 text-slate-600 uppercase tracking-wider">Bàn giao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => {
                        const soldPct = project.totalUnits && project.soldUnits ?
                          Math.round((project.soldUnits / project.totalUnits) * 100) : 0;
                        
                        return (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0 h-14" // Fixed height for compactness
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <TableCell className="py-2 pl-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border border-slate-200 rounded-lg">
                                  <AvatarImage src={project.image} alt={project.name} className="object-cover" />
                                  <AvatarFallback className="text-xs font-bold bg-blue-50 text-blue-600 rounded-lg">
                                    {project.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm leading-tight text-slate-900 group-hover:text-primary transition-colors truncate max-w-[180px]">
                                    {project.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                                    {project.developer}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="py-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-xs text-slate-700">{project.district}</div>
                                  <div className="text-[10px] text-slate-500">{project.city === "TP. Hồ Chí Minh" ? "HCM" : project.city}</div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-right py-2">
                              <div className="font-bold text-primary text-sm">
                                {formatPrice(project.pricePerSqm)}
                              </div>
                              <div className="text-[10px] text-slate-500">/m²</div>
                            </TableCell>

                            <TableCell className="text-right py-2">
                              <div className="font-medium text-sm text-slate-700">
                                {project.priceRange.split(' ')[0]} <span className="text-[10px]">tỷ</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right py-2">
                              {project.launchPrice && project.currentPrice ? (
                                <PriceChangeIndicator
                                  currentPrice={project.currentPrice}
                                  launchPrice={project.launchPrice}
                                  showIcon={false}
                                  className="text-xs"
                                />
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center py-2">
                              {soldPct > 0 ? (
                                <div className="space-y-1">
                                  <div className="font-bold text-xs text-slate-700">{soldPct}%</div>
                                  <Progress value={soldPct} className="h-1 w-12 mx-auto bg-slate-100" />
                                </div>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-center py-2">
                              <StatusBadge variant={getStatusVariant(project.status)} className="font-semibold text-[10px] px-2 py-0.5 rounded-full border-0 h-5">
                                {project.legalScore}/10
                              </StatusBadge>
                            </TableCell>
                            
                            <TableCell className="text-center pr-4 py-2">
                              <div className="text-xs font-medium text-slate-600">
                                {project.completionDate.includes('20') ? project.completionDate.substring(project.completionDate.indexOf('20')) : project.completionDate}
                              </div>
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
        </div>
      </DesktopLayout>
    </>
  );
};

export default MarketOverview;