import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import SEOHead from "@/components/seo/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { projectsData } from "@/data/projectsData";
import { getProjectPhase, getPriceTrendColor } from "@/utils/projectPhases";
import { 
  Search, Download, Building2, MapPin, 
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpDown, ArrowUp, ArrowDown, Minus,
  Activity, Filter, LayoutGrid, List as ListIcon
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import ProjectGridCard from "@/components/project/ProjectGridCard";

const MarketOverview = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  
  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // Default to TABLE
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'updatedAt', 
    direction: 'desc' 
  });

  // --- DATA PROCESSING ---

  // 1. Enrich Data
  const enrichedProjects = useMemo(() => {
    return projectsData.map(p => {
      const { phase, label: phaseLabel, color: phaseColor } = getProjectPhase(p);
      
      // Calculate Price Trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let trendPercent = 0;
      if (p.priceHistory && p.priceHistory.length >= 2) {
        const curr = p.priceHistory[p.priceHistory.length - 1].price;
        const prev = p.priceHistory[p.priceHistory.length - 2].price;
        trend = curr > prev ? 'up' : curr < prev ? 'down' : 'stable';
        trendPercent = ((curr - prev) / prev) * 100;
      } else if (p.launchPrice && p.currentPrice) {
        trend = p.currentPrice > p.launchPrice ? 'up' : p.currentPrice < p.launchPrice ? 'down' : 'stable';
        trendPercent = ((p.currentPrice - p.launchPrice) / p.launchPrice) * 100;
      }

      return {
        ...p,
        phase,
        phaseLabel,
        phaseColor,
        trend,
        trendPercent: Math.abs(trendPercent).toFixed(1),
        updatedAt: p.priceHistory?.[p.priceHistory.length - 1]?.date || p.launchDate || "2023-01-01"
      };
    });
  }, []);

  // 2. Filter & Sort
  const processedProjects = useMemo(() => {
    let result = [...enrichedProjects];

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.developer.toLowerCase().includes(lowerQuery) ||
        p.location.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by Phase
    if (phaseFilter !== "all") {
      result = result.filter(p => p.phase === phaseFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      if (sortConfig.key === 'pricePerSqm' || sortConfig.key === 'legalScore' || sortConfig.key === 'rentalYield') {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [enrichedProjects, searchQuery, phaseFilter, sortConfig]);

  // 3. Calculate Market Stats (KPIs)
  const stats = useMemo(() => {
    const total = processedProjects.length;
    const avgPrice = total > 0 
      ? processedProjects.reduce((sum, p) => sum + p.pricePerSqm, 0) / total 
      : 0;
    const upCount = processedProjects.filter(p => p.trend === 'up').length;
    const downCount = processedProjects.filter(p => p.trend === 'down').length;
    const avgYield = total > 0
      ? processedProjects.reduce((sum, p) => sum + (p.rentalYield || 0), 0) / total
      : 0;

    return { total, avgPrice, upCount, downCount, avgYield };
  }, [processedProjects]);

  // --- HANDLERS ---

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatPriceShort = (price: number) => {
    return (price / 1000000).toFixed(1) + " tr";
  };

  // --- RENDER ---

  const content = (
    <div className="space-y-6 h-full flex flex-col">
      {/* 1. Market KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Dự án theo dõi</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{stats.total}</span>
              <span className="text-xs text-muted-foreground font-medium">dự án</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Giá trung bình</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatPriceShort(stats.avgPrice)}</span>
              <span className="text-xs text-muted-foreground">/m²</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Xu hướng</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                <ArrowUp className="w-4 h-4 mr-1" /> {stats.upCount}
              </div>
              <div className="flex items-center text-rose-600 dark:text-rose-400 text-sm font-bold">
                <ArrowDown className="w-4 h-4 mr-1" /> {stats.downCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Lợi nhuận thuê</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-500">{stats.avgYield.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">/năm</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Control Bar (Filters & View Toggle) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm sticky top-[64px] z-20">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm dự án, chủ đầu tư, quận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <Tabs value={phaseFilter} onValueChange={setPhaseFilter} className="h-10">
            <TabsList className="h-10 bg-muted/50">
              <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
              <TabsTrigger value="selling" className="text-xs">Sơ cấp</TabsTrigger>
              <TabsTrigger value="secondary" className="text-xs">Thứ cấp</TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs">Sắp mở</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-6 w-px bg-border mx-1 hidden md:block" />

          {/* View Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 w-8 p-0 rounded-md"
              title="Xem dạng bảng"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0 rounded-md"
              title="Xem dạng lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-10 hidden md:flex">
            <Download className="w-4 h-4 mr-2" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* 3. Data Table */}
      {viewMode === 'table' ? (
        <Card className="border-border shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[300px]">
                    <Button variant="ghost" onClick={() => handleSort('name')} className="hover:bg-transparent px-0 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Dự án & Chủ đầu tư <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Khu vực</span>
                  </TableHead>
                  <TableHead>
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Giai đoạn</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('pricePerSqm')} className="hover:bg-transparent px-0 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Giá / m² <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Biến động</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort('legalScore')} className="hover:bg-transparent px-0 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Pháp lý <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">
                    <Button variant="ghost" onClick={() => handleSort('rentalYield')} className="hover:bg-transparent px-0 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      ROI <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Thao tác</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {/* Project Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-lg border border-border">
                          <AvatarImage src={project.image} className="object-cover" />
                          <AvatarFallback className="rounded-lg">P</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {project.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {project.developer}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{project.district}</span>
                        <span className="text-xs text-muted-foreground">{project.city}</span>
                      </div>
                    </TableCell>

                    {/* Phase */}
                    <TableCell>
                      <Badge className={`${project.phaseColor} border-0 font-medium text-[10px] whitespace-nowrap shadow-none`}>
                        {project.phaseLabel}
                      </Badge>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground text-sm">
                          {formatPriceShort(project.pricePerSqm)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {project.priceRange.split(' ')[0]} tỷ
                        </span>
                      </div>
                    </TableCell>

                    {/* Trend */}
                    <TableCell className="text-center">
                      {project.trend !== 'stable' ? (
                        <Badge 
                          variant="outline" 
                          className={`border-0 ${
                            project.trend === 'up' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}
                        >
                          {project.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {project.trendPercent}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Legal */}
                    <TableCell className="text-center">
                      <div className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        project.legalScore >= 8 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {project.legalScore}/10
                      </div>
                    </TableCell>

                    {/* ROI */}
                    <TableCell className="text-center">
                      {project.rentalYield ? (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {project.rentalYield}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {processedProjects.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Không tìm thấy dự án nào phù hợp bộ lọc.</p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setPhaseFilter("all"); }}
                  className="mt-2"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedProjects.map((project) => (
            <div key={project.id} className="animate-fade-in">
               <ProjectGridCard 
                project={project} 
                onClick={() => navigate(`/projects/${project.id}`)} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4">
           {/* Simplify for Mobile: Title + Search only */}
           <div className="flex items-center justify-between mb-4">
             <h1 className="text-2xl font-bold">Thị trường</h1>
             <Badge variant="secondary">{processedProjects.length} dự án</Badge>
           </div>
           
           <div className="relative mb-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
             <Input
                placeholder="Tìm dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
             />
           </div>

           {/* Force Grid view on mobile regardless of state, but show simplified cards */}
           <div className="space-y-4">
             {processedProjects.map((project) => (
                <ProjectGridCard 
                  key={project.id}
                  project={project} 
                  onClick={() => navigate(`/projects/${project.id}`)} 
                />
             ))}
           </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <DesktopLayout title="Thị trường" subtitle="Tổng quan & Phân tích dữ liệu">
      <SEOHead title="Tổng quan thị trường BĐS" description="Bảng giá, xu hướng và phân tích thị trường bất động sản mới nhất." />
      {content}
    </DesktopLayout>
  );
};

export default MarketOverview;