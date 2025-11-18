import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Building2, User, Calendar, Star, Waves, Dumbbell, Trophy, ShoppingCart, Car, TreePine, Users, Phone, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import FavoriteButton from "./FavoriteButton";
import { ProjectROI } from "./ProjectROI";

interface ProjectOverviewProps {
  project: Project;
  onConsultationClick: () => void;
}

const ProjectOverview = ({ project, onConsultationClick }: ProjectOverviewProps) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

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
      
      {/* Project Info & Stats - Combined */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <Building2 className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{project.floors}</div>
              <div className="text-xs text-muted-foreground">Số tầng</div>
            </div>
            <div className="text-center">
              <MapPin className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{project.district}</div>
              <div className="text-xs text-muted-foreground">Khu vực</div>
            </div>
            <div className="text-center">
              <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm font-semibold text-foreground">{project.completionDate}</div>
              <div className="text-xs text-muted-foreground">Hoàn thành</div>
            </div>
            <div className="text-center">
              <Button 
                onClick={onConsultationClick}
                size="sm"
                className="w-full h-8 text-xs"
              >
                Tư vấn ngay
              </Button>
            </div>
          </div>

          {/* Sales Progress - Integrated */}
          {project.totalUnits && project.soldUnits && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tiến độ bán hàng</span>
                <span className="text-sm text-muted-foreground">
                  {project.soldUnits}/{project.totalUnits} căn
                </span>
              </div>
              <Progress 
                value={(project.soldUnits / project.totalUnits) * 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((project.soldUnits / project.totalUnits) * 100)}% đã bán
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amenities & Description - Combined */}
      <Card>
        <CardContent className="p-4">
          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3">Tiện ích nổi bật</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.amenities.slice(0, 6).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <IconComponent className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              {project.amenities.length > 6 && (
                <div className="text-xs text-muted-foreground mt-2">
                  +{project.amenities.length - 6} tiện ích khác
                </div>
              )}
            </div>
          )}

          {/* Project Description */}
          {project.description && (
            <div className={project.amenities?.length ? "border-t pt-4" : ""}>
              <h3 className="text-base font-semibold mb-3">Mô tả dự án</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}
          
          {/* Legal Warnings */}
          {project.warnings && project.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-destructive mb-1">
                    Cảnh báo pháp lý
                  </div>
                  <ul className="text-xs text-destructive/80 space-y-1">
                    {project.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
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