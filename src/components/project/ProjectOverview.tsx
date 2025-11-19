import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Building2, Calendar, Star, Waves, Dumbbell, Trophy, ShoppingCart, Car, TreePine, Users, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import { ProjectROI } from "./ProjectROI";

interface ProjectOverviewProps {
  project: Project;
  onConsultationClick: () => void;
}

const ProjectOverview = ({ project, onConsultationClick }: ProjectOverviewProps) => {
  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      "Hồ bơi": Waves,
      "Gym": Dumbbell,
      "Sân tennis": Trophy,
      "Công viên": TreePine,
      "Siêu thị": ShoppingCart,
      "Bến du thuyền": Car,
      "Khu BBQ": Users,
      "Phòng yoga": Star,
    };
    return iconMap[amenity] || Star;
  };

  return (
    <div className="space-y-4">
      {/* ROI Section */}
      <ProjectROI project={project} />
      
      {/* Project Info & Stats */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Building2 className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-bold text-foreground">{project.floors || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Số tầng</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-semibold text-foreground truncate px-1">{project.district}</div>
              <div className="text-xs text-muted-foreground">Khu vực</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-semibold text-foreground">{project.completionDate}</div>
              <div className="text-xs text-muted-foreground">Hoàn thành</div>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={onConsultationClick}
                className="w-full h-full min-h-[80px] flex flex-col gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none"
                variant="outline"
              >
                <span className="font-bold">Tư vấn ngay</span>
                <span className="text-xs opacity-80">Nhận báo giá chi tiết</span>
              </Button>
            </div>
          </div>

          {/* Sales Progress */}
          {project.totalUnits && project.soldUnits && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tiến độ bán hàng</span>
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="text-primary font-bold">{project.soldUnits}</span>/{project.totalUnits} căn
                </span>
              </div>
              <Progress 
                value={(project.soldUnits / project.totalUnits) * 100} 
                className="h-2.5 bg-muted"
              />
              <div className="flex justify-between mt-1.5">
                <div className="text-xs text-muted-foreground">Đã bán</div>
                <div className="text-xs font-medium text-primary">
                  {Math.round((project.soldUnits / project.totalUnits) * 100)}%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenities & Description */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold mb-4 text-foreground">Tiện ích nổi bật</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.amenities.slice(0, 6).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors">
                      <div className="p-1.5 rounded-md bg-background shadow-sm text-primary">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-foreground/80 font-medium truncate">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              {project.amenities.length > 6 && (
                <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground w-full">
                  +{project.amenities.length - 6} tiện ích khác
                </Button>
              )}
            </div>
          )}

          {/* Project Description */}
          {project.description && (
            <div className={project.amenities?.length ? "border-t border-border pt-6" : ""}>
              <h3 className="text-base font-semibold mb-3 text-foreground">Mô tả dự án</h3>
              <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
                {project.description}
              </div>
            </div>
          )}
          
          {/* Legal Warnings */}
          {project.warnings && project.warnings.length > 0 && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-pulse-slow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-destructive/20 rounded-full shrink-0">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <div className="text-sm font-bold text-destructive mb-1">
                    Cảnh báo pháp lý
                  </div>
                  <ul className="text-xs text-destructive/90 space-y-1.5 list-disc pl-4">
                    {project.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;