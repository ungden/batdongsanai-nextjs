import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, User, AlertTriangle, TrendingUp } from "lucide-react";
import { Project } from "@/types/project";
import FavoriteButton from "./FavoriteButton";
import { AddToCompareButton } from "@/components/AddToCompareButton";

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(price / 1000000);
  };

  return (
    <Card 
      className="group bg-white border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer"
      onClick={() => onClick(project.id)}
    >
      <div className="flex p-4 gap-4">
        {/* Image Thumbnail */}
        <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {project.status === 'good' && (
            <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {project.legalScore}/10
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <AddToCompareButton project={project as any} variant="ghost" size="icon" className="h-6 w-6" showText={false} />
                <FavoriteButton projectId={project.id} projectName={project.name} className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{project.location}</span>
            </div>
            
            <div className="flex items-center text-xs text-slate-500 mt-0.5">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{project.developer}</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-lg font-bold text-primary leading-none">
                {project.priceRange.split(' ')[0]} <span className="text-xs font-normal text-slate-500">tỷ</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                ~{formatPrice(project.pricePerSqm)} tr/m²
              </div>
            </div>
            
            {project.warnings.length > 0 ? (
              <Badge variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50">
                <AlertTriangle className="w-3 h-3 mr-1" /> {project.warnings.length} lưu ý
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                {project.status === 'good' ? 'Pháp lý tốt' : 'Đang cập nhật'}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;