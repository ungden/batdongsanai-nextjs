import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, MapPin, Building2, Shield, CheckCircle, 
  Calendar, Briefcase, DollarSign, Home, Star, Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SocialShare } from "@/components/SocialShare";
import { PriceAlertDialog } from "@/components/PriceAlertDialog";
import { AppointmentBookingDialog } from "@/components/AppointmentBookingDialog";
import { AddToPortfolioDialog } from "@/components/AddToPortfolioDialog";
import FavoriteButton from "@/components/project/FavoriteButton";
import { Project } from "@/types/project";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProjectHeroProps {
  project: Project;
}

export const ProjectHero = ({ project }: ProjectHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb / Back */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="text-slate-500 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          
          <div className="flex gap-2">
            <SocialShare url={window.location.href} title={project.name} variant="ghost" size="sm" />
            <FavoriteButton projectId={project.id} projectName={project.name} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2">
              {project.status === 'good' && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                  <Shield className="w-3 h-3 mr-1" /> Pháp lý an toàn
                </Badge>
              )}
              {project.completionDate === "Đã hoàn thành" && (
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" /> Đã bàn giao
                </Badge>
              )}
              <Badge variant="outline">{project.district}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {project.name}
            </h1>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {project.location}
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-primary cursor-pointer hover:underline"
                  onClick={() => navigate(`/developers/${project.developer.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  {project.developer}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions / Price Box */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Giá tham khảo</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{project.priceRange}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  ~{formatCurrency(project.pricePerSqm)} / m²
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <AppointmentBookingDialog
                  projectId={project.id}
                  projectName={project.name}
                  triggerButton={
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Calendar className="w-4 h-4 mr-2" />
                      Đặt lịch xem
                    </Button>
                  }
                />
                <PriceAlertDialog
                  projectId={project.id}
                  projectName={project.name}
                  currentPrice={project.pricePerSqm}
                />
              </div>
              
              <AddToPortfolioDialog
                projectId={project.id}
                projectName={project.name}
                currentPrice={project.pricePerSqm}
                triggerButton={
                  <Button variant="outline" className="w-full bg-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Thêm vào Portfolio
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};