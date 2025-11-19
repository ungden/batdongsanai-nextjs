import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopLayout from "@/components/layout/DesktopLayout";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { developersData } from "@/data/developersData";
import { projectsData } from "@/data/projectsData";
import { Building2, Phone, Globe, Search, Award, Users, Filter, CheckCircle2, AlertCircle, ArrowRight, LayoutGrid } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Developers = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { trackProjectView } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("projects");
  const [filterByStatus, setFilterByStatus] = useState("all");

  const filteredAndSortedDevelopers = useMemo(() => {
    let filtered = developersData.filter(developer => {
      const matchesSearch = developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.description?.toLowerCase().includes(searchTerm.toLowerCase());

      let status = "good";
      if (developer.avgLegalScore < 6) status = "danger";
      else if (developer.avgLegalScore < 8) status = "warning";

      const matchesStatus = filterByStatus === "all" || filterByStatus === status;

      return matchesSearch && matchesStatus;
    });

    switch (sortBy) {
      case "projects":
        return filtered.sort((a, b) => b.totalProjects - a.totalProjects);
      case "legal-score":
        return filtered.sort((a, b) => b.avgLegalScore - a.avgLegalScore);
      case "name":
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [searchTerm, sortBy, filterByStatus]);

  const handleDeveloperClick = (developer: any) => {
    const developerId = developer.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/developers/${developerId}`);
  };

  const getDeveloperStats = useCallback((developer: any) => {
    const developerProjects = projectsData.filter(p => p.developer === developer.name);
    const totalUnits = developerProjects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
    return { totalUnits };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const content = (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Chủ đầu tư uy tín
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Danh sách các chủ đầu tư hàng đầu Việt Nam được đánh giá dựa trên năng lực tài chính, pháp lý và chất lượng bàn giao.
          </p>
          <div className="flex gap-4 pt-2">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
               <span className="text-sm font-medium text-emerald-100">{developersData.length} Chủ đầu tư</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
               <span className="text-sm font-medium text-blue-100">
                 {developersData.reduce((acc, curr) => acc + curr.totalProjects, 0)}+ Dự án
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm chủ đầu tư..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-background"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-10 bg-background">
              <LayoutGrid className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="projects">Nhiều dự án nhất</SelectItem>
              <SelectItem value="legal-score">Pháp lý tốt nhất</SelectItem>
              <SelectItem value="name">Tên A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterByStatus} onValueChange={setFilterByStatus}>
            <SelectTrigger className="w-[150px] h-10 bg-background">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Độ uy tín" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="good">Uy tín cao</SelectItem>
              <SelectItem value="warning">Cảnh báo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Developers List */}
      <div className="grid gap-4">
        {filteredAndSortedDevelopers.length > 0 ? (
          filteredAndSortedDevelopers.map((developer) => {
            const stats = getDeveloperStats(developer);
            return (
              <Card 
                key={developer.id} 
                className="group hover:shadow-lg transition-all duration-300 border-border/60 bg-card overflow-hidden cursor-pointer"
                onClick={() => handleDeveloperClick(developer)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center justify-center md:w-64 bg-muted/10 border-b md:border-b-0 md:border-r border-border/60">
                      <Avatar className="w-24 h-24 rounded-2xl border-2 border-border bg-white shadow-sm">
                        <AvatarImage src={developer.logo} alt={developer.name} className="object-contain p-2" />
                        <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary rounded-2xl">
                          {developer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                            {developer.name}
                            {developer.avgLegalScore >= 8 && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                            )}
                          </h3>
                          
                          <div className="flex gap-2">
                            {developer.specialties?.slice(0, 3).map((spec, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground hover:bg-muted">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                          {developer.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-dashed border-border">
                          <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Dự án</div>
                            <div className="text-lg font-bold text-foreground">{developer.totalProjects}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Tổng căn</div>
                            <div className="text-lg font-bold text-foreground">{stats.totalUnits.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Pháp lý</div>
                            <div className={`text-lg font-bold ${getScoreColor(developer.avgLegalScore)}`}>
                              {developer.avgLegalScore}/10
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Rating</div>
                            <div className="text-lg font-bold text-amber-500 flex items-center gap-1">
                              {developer.avgRating} <Award className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex gap-4 text-sm text-muted-foreground">
                            {developer.hotline && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" /> {developer.hotline}
                              </div>
                            )}
                            {developer.website && (
                              <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <Globe className="w-3.5 h-3.5" /> Website
                              </div>
                            )}
                         </div>
                         <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/10 hover:text-primary -mr-2">
                            Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                         </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy chủ đầu tư</h3>
            <p className="text-muted-foreground mt-1">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setSearchTerm(""); setFilterByStatus("all"); }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="Danh sách Chủ đầu tư - PropertyHub"
          description="Khám phá thông tin chi tiết về các chủ đầu tư uy tín trong thị trường bất động sản Việt Nam."
          keywords="chủ đầu tư, developer, bất động sản, pháp lý, dự án"
        />
        <div className="min-h-screen bg-background pb-20">
          <div className="p-4">
            {content}
          </div>
          <BottomNavigation />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Danh sách Chủ đầu tư - PropertyHub"
        description="Khám phá thông tin chi tiết về các chủ đầu tư uy tín trong thị trường bất động sản Việt Nam."
        keywords="chủ đầu tư, developer, bất động sản, pháp lý, dự án"
      />
      <DesktopLayout title="Chủ đầu tư" subtitle={`${developersData.length} chủ đầu tư`}>
        {content}
      </DesktopLayout>
    </>
  );
};

export default Developers;