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
    <div className="space-y-5">
      {/* ROI Section */}
      <ProjectROI project={project} />
      
      {/* Project Info & Stats */}
      <Card className="bg-card border-border shadow-sm rounded-xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
              <Building2 className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-base font-bold text-foreground">{project.floors || 'N/A'}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Số tầng</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
              <MapPin className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-semibold text-foreground truncate px-1">{project.district}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Khu vực</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
              <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
              <div className="text-sm font-semibold text-foreground">{project.completionDate}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Hoàn thành</div>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={onConsultationClick}
                className="w-full h-full min-h-[70px] flex flex-col gap-0.5 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20 shadow-none rounded-lg"
                variant="outline"
              >
                <span className="font-bold text-sm">Tư vấn ngay</span>
                <span className="text-[10px] opacity-80">Nhận báo giá chi tiết</span>
              </Button>
            </div>
          </div>

          {/* Sales Progress */}
          {project.totalUnits && project.soldUnits && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Tiến độ bán hàng</span>
                <span className="text-xs font-medium text-muted-foreground">
                  <span className="text-primary font-bold">{project.soldUnits}</span>/{project.totalUnits} căn
                </span>
              </div>
              <Progress 
                value={(project.soldUnits / project.totalUnits) * 100} 
                className="h-2 bg-muted"
              />
              <div className="flex justify-between mt-1.5">
                <div className="text-[10px] text-muted-foreground">Đã bán</div>
                <div className="text-[10px] font-medium text-primary">
                  {Math.round((project.soldUnits / project.totalUnits) * 100)}%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenities & Description */}
      <Card className="bg-card border-border shadow-sm rounded-xl">
        <CardContent className="p-5">
          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Tiện ích nổi bật
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {project.amenities.slice(0, 6).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                      <div className="p-1 rounded-md bg-background shadow-sm text-primary shrink-0">
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs text-foreground/90 font-medium truncate">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              {project.amenities.length > 6 && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground w-full h-8">
                  +{project.amenities.length - 6} tiện ích khác
                </Button>
              )}
            </div>
          )}

          {/* Project Description */}
          {project.description && (
            <div className={project.amenities?.length ? "border-t border-border pt-5" : ""}>
              <h3 className="text-sm font-bold mb-2 text-foreground">Mô tả dự án</h3>
              <div className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/30">
                {project.description}
              </div>
            </div>
          )}
          
          {/* Legal Warnings */}
          {project.warnings && project.warnings.length > 0 && (
            <div className="mt-5 p-3 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-lg">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-0.5">
                    Cảnh báo pháp lý
                  </div>
                  <ul className="text-xs text-red-600/90 dark:text-red-400/90 space-y-1 list-disc pl-3">
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