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
import { Building2, Phone, Mail, Globe, Search, Award, Users, Filter, ArrowUpDown, CheckCircle2, AlertCircle, XCircle, Sparkles, TrendingUp } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Developers = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { trackProjectView } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterByStatus, setFilterByStatus] = useState("all");
  const [filterBySpecialty, setFilterBySpecialty] = useState("all");

  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    developersData.forEach(dev => {
      dev.specialties?.forEach(s => specialties.add(s));
    });
    return Array.from(specialties).sort();
  }, []);

  const filteredAndSortedDevelopers = useMemo(() => {
    let filtered = developersData.filter(developer => {
      const matchesSearch = developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSpecialty = filterBySpecialty === "all" || 
        developer.specialties?.includes(filterBySpecialty);

      let status = "good";
      if (developer.avgLegalScore < 6) status = "danger";
      else if (developer.avgLegalScore < 8) status = "warning";

      const matchesStatus = filterByStatus === "all" || filterByStatus === status;

      return matchesSearch && matchesSpecialty && matchesStatus;
    });

    switch (sortBy) {
      case "projects":
        return filtered.sort((a, b) => b.totalProjects - a.totalProjects);
      case "legal-score":
        return filtered.sort((a, b) => b.avgLegalScore - a.avgLegalScore);
      case "rating":
        return filtered.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      case "name":
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [searchTerm, sortBy, filterByStatus, filterBySpecialty]);

  const handleDeveloperClick = (developer: any) => {
    const developerId = developer.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/developers/${developerId}`);
  };

  const getDeveloperStats = useCallback((developer: any) => {
    const developerProjects = projectsData.filter(p => p.developer === developer.name);
    const totalUnits = developerProjects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
    const statusCounts = {
      good: developerProjects.filter(p => p.status === "good").length,
      warning: developerProjects.filter(p => p.status === "warning").length,
      danger: developerProjects.filter(p => p.status === "danger").length
    };
    
    return { totalUnits, statusCounts };
  }, []);

  const getStatusBadge = (legalScore: number) => {
    if (legalScore >= 8) {
      return (
        <Badge className="bg-success text-white border-0 flex items-center gap-1 shadow-md">
          <CheckCircle2 className="w-3 h-3" />
          Uy tín cao
        </Badge>
      );
    } else if (legalScore >= 6) {
      return (
        <Badge className="bg-warning text-white border-0 flex items-center gap-1 shadow-md">
          <AlertCircle className="w-3 h-3" />
          Trung bình
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-destructive text-white border-0 flex items-center gap-1 shadow-md">
          <XCircle className="w-3 h-3" />
          Cần thận trọng
        </Badge>
      );
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold shadow-lg border border-white/20">
            <Sparkles className="w-4 h-4" />
            Đánh giá chủ đầu tư uy tín
          </div>
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-4 shadow-xl border border-white/20">
            <Users className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white">Chủ đầu tư</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
            Khám phá thông tin chi tiết về các chủ đầu tư uy tín trong thị trường bất động sản Việt Nam
          </p>
          
          <div className="flex items-center justify-center gap-8 pt-6">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">{developersData.length}</div>
              <div className="text-sm text-white/80 font-medium">Chủ đầu tư</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">
                {developersData.reduce((sum, d) => sum + d.totalProjects, 0)}
              </div>
              <div className="text-sm text-white/80 font-medium">Dự án</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-white">
                {(developersData.reduce((sum, d) => sum + d.avgLegalScore, 0) / developersData.length).toFixed(1)}
              </div>
              <div className="text-sm text-white/80 font-medium">Điểm PL TB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl rounded-2xl bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Tìm kiếm chủ đầu tư theo tên, mô tả, chuyên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-xl text-base border-2 focus:border-primary bg-slate-50"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Sắp xếp theo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên A-Z</SelectItem>
                  <SelectItem value="projects">Số dự án nhiều nhất</SelectItem>
                  <SelectItem value="legal-score">Điểm pháp lý cao nhất</SelectItem>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Lọc theo uy tín" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả uy tín</SelectItem>
                  <SelectItem value="good">Uy tín cao (8-10)</SelectItem>
                  <SelectItem value="warning">Trung bình (6-8)</SelectItem>
                  <SelectItem value="danger">Cần thận trọng (&lt;6)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBySpecialty} onValueChange={setFilterBySpecialty}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Lọc theo chuyên môn" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chuyên môn</SelectItem>
                  {allSpecialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchTerm || filterByStatus !== "all" || filterBySpecialty !== "all") && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground font-medium">Đang lọc:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                    Tìm kiếm: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-destructive font-bold">×</button>
                  </Badge>
                )}
                {filterByStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                    Uy tín: {filterByStatus === "good" ? "Cao" : filterByStatus === "warning" ? "Trung bình" : "Thận trọng"}
                    <button onClick={() => setFilterByStatus("all")} className="ml-1 hover:text-destructive font-bold">×</button>
                  </Badge>
                )}
                {filterBySpecialty !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                    {filterBySpecialty}
                    <button onClick={() => setFilterBySpecialty("all")} className="ml-1 hover:text-destructive font-bold">×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterByStatus("all");
                    setFilterBySpecialty("all");
                  }}
                  className="h-8 text-xs rounded-full font-semibold"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-muted-foreground text-lg">
          Tìm thấy <span className="font-bold text-foreground text-xl">{filteredAndSortedDevelopers.length}</span> chủ đầu tư
        </p>
      </div>

      {/* Developers Grid */}
      <div className="grid gap-6">
        {filteredAndSortedDevelopers.length > 0 ? (
          filteredAndSortedDevelopers.map((developer, index) => {
            const stats = getDeveloperStats(developer);
            
            return (
              <Card 
                key={developer.id} 
                className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg group cursor-pointer hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-2xl overflow-hidden"
                onClick={() => handleDeveloperClick(developer)}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-slate-100 shadow-xl">
                          <AvatarImage src={developer.logo} alt={developer.name} />
                          <AvatarFallback className="text-3xl font-black bg-primary text-white">
                            {developer.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {developer.avgLegalScore >= 8 && (
                          <div className="absolute -bottom-2 -right-2 bg-success text-white rounded-full p-2.5 shadow-lg ring-4 ring-white">
                            <Award className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 space-y-5">
                      {/* Header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <h3 className="text-2xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                            {developer.name}
                          </h3>
                          {getStatusBadge(developer.avgLegalScore)}
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {developer.description}
                        </p>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {developer.hotline && (
                          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Phone className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-semibold text-sm text-foreground">{developer.hotline}</span>
                          </div>
                        )}
                        {developer.email && (
                          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <span className="truncate font-semibold text-sm text-foreground">{developer.email}</span>
                          </div>
                        )}
                        {developer.website && (
                          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-primary" />
                            </div>
                            <span className="truncate font-semibold text-sm text-foreground">{developer.website}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Specialties */}
                      {developer.specialties && developer.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {developer.specialties.slice(0, 4).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-slate-50 border-slate-300 rounded-lg px-3 py-1.5 font-semibold">
                              {specialty}
                            </Badge>
                          ))}
                          {developer.specialties.length > 4 && (
                            <Badge variant="outline" className="text-xs bg-slate-100 border-slate-300 rounded-lg px-3 py-1.5 font-semibold">
                              +{developer.specialties.length - 4} khác
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats Section */}
                    <div className="flex md:flex-col gap-3 md:w-52 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div className="flex-1 text-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="text-3xl font-black text-primary mb-1">{developer.totalProjects}</div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Dự án</div>
                      </div>
                      <div className="flex-1 text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="text-3xl font-black text-success mb-1">{stats.totalUnits.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Căn hộ</div>
                      </div>
                      <div className="flex-1 text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="text-3xl font-black text-warning mb-1">{developer.avgLegalScore}<span className="text-lg">/10</span></div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Pháp lý</div>
                      </div>
                      <div className="flex-1 text-center p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <div className="text-3xl font-black text-accent mb-1">{developer.avgRating}<span className="text-lg">/5</span></div>
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-0 shadow-xl rounded-2xl bg-white">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-black">Không tìm thấy chủ đầu tư</h3>
                <p className="text-muted-foreground text-lg">
                  Không có chủ đầu tư nào phù hợp với tiêu chí tìm kiếm của bạn
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterByStatus("all");
                    setFilterBySpecialty("all");
                  }}
                  className="rounded-xl h-12 px-8 font-semibold"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="Danh sách Chủ đầu tư - PropertyHub"
          description="Khám phá thông tin chi tiết về các chủ đầu tư uy tín trong thị trường bất động sản Việt Nam. Xem điểm pháp lý, dự án và đánh giá."
          keywords="chủ đầu tư, developer, bất động sản, pháp lý, dự án"
        />
        <div className="min-h-screen bg-slate-50 pb-20">
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
        description="Khám phá thông tin chi tiết về các chủ đầu tư uy tín trong thị trường bất động sản Việt Nam. Xem điểm pháp lý, dự án và đánh giá."
        keywords="chủ đầu tư, developer, bất động sản, pháp lý, dự án"
      />
      <DesktopLayout title="Chủ đầu tư" subtitle={`${developersData.length} chủ đầu tư`}>
        {content}
      </DesktopLayout>
    </>
  );
};

export default Developers;