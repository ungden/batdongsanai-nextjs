import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, TrendingUp, TrendingDown, ExternalLink, Calendar } from "lucide-react";
import { Project } from "@/types/project";
import { calculateROI, formatROIDisplay, getROIStatus } from "@/utils/roiCalculations";

interface RecentProjectsTableProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

type SortField = "name" | "launchDate" | "roi" | "salesRate" | "status" | "legalScore";
type SortDirection = "asc" | "desc";

export const RecentProjectsTable = ({ projects, onProjectClick }: RecentProjectsTableProps) => {
  const [sortField, setSortField] = useState<SortField>("launchDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and sort projects
  const processedProjects = useMemo(() => {
    let filtered = projects;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort projects
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "launchDate":
          aValue = new Date(a.launchDate || "").getTime();
          bValue = new Date(b.launchDate || "").getTime();
          break;
        case "roi":
          aValue = a.launchPrice && a.currentPrice ? calculateROI(a.launchPrice, a.currentPrice) : -Infinity;
          bValue = b.launchPrice && b.currentPrice ? calculateROI(b.launchPrice, b.currentPrice) : -Infinity;
          break;
        case "salesRate":
          aValue = a.totalUnits ? ((a.soldUnits || 0) / a.totalUnits) * 100 : 0;
          bValue = b.totalUnits ? ((b.soldUnits || 0) / b.totalUnits) * 100 : 0;
          break;
        case "status":
          const statusOrder = { "good": 3, "warning": 2, "danger": 1 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case "legalScore":
          aValue = a.legalScore;
          bValue = b.legalScore;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [projects, sortField, sortDirection, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 1000000).toFixed(1)}M`;
  };

  const getSalesRate = (project: Project) => {
    if (!project.totalUnits) return 0;
    return ((project.soldUnits || 0) / project.totalUnits) * 100;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "good": return "success";
      case "warning": return "warning";
      case "danger": return "danger";
      default: return "neutral";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good": return "Tốt";
      case "warning": return "Cảnh báo";
      case "danger": return "Rủi ro";
      default: return "Không xác định";
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-headline-3">Phân tích chi tiết dự án gần đây</CardTitle>
          
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] btn-modern">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="good">Tốt</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
                <SelectItem value="danger">Rủi ro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Dự án
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("launchDate")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Ngày mở bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("roi")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    ROI
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("salesRate")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Tỷ lệ bán
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("legalScore")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Điểm pháp lý
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("status")}
                    className="h-auto p-0 font-bold hover:bg-transparent"
                  >
                    Trạng thái
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-bold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedProjects.map((project, index) => {
                const roi = project.launchPrice && project.currentPrice 
                  ? calculateROI(project.launchPrice, project.currentPrice) 
                  : null;
                const salesRate = getSalesRate(project);
                
                return (
                  <TableRow 
                    key={project.id} 
                    className="group hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-semibold">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.location}
                        </div>
                        <div className="text-sm font-medium text-accent">
                          {formatPrice(project.currentPrice || project.pricePerSqm)}/m²
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {project.launchDate 
                            ? new Date(project.launchDate).toLocaleDateString('vi-VN')
                            : "Chưa rõ"
                          }
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {roi !== null ? (
                        <div className="flex items-center gap-2">
                          {roi > 0 ? (
                            <TrendingUp className="w-4 h-4 text-success" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-destructive" />
                          )}
                          <Badge 
                            variant={getROIStatus(roi) === 'positive' ? 'secondary' : 
                                   getROIStatus(roi) === 'negative' ? 'destructive' : 'outline'}
                            className="font-bold"
                          >
                            {formatROIDisplay(roi)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{salesRate.toFixed(1)}%</span>
                          <span className="text-muted-foreground">
                            {project.soldUnits?.toLocaleString() || 0}/{project.totalUnits?.toLocaleString() || 0}
                          </span>
                        </div>
                        <Progress 
                          value={salesRate} 
                          className="h-2" 
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-black text-primary">
                          {project.legalScore}
                        </div>
                        <div className="text-sm text-muted-foreground">/10</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <StatusBadge 
                        variant={getStatusVariant(project.status)}
                        className="font-semibold"
                      >
                        {getStatusText(project.status)}
                      </StatusBadge>
                    </TableCell>
                    
                    <TableCell>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onProjectClick(project.id)}
                        className="btn-modern group-hover:shadow-md transition-all"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {processedProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có dự án nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};