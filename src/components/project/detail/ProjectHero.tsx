import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  ArrowLeft, MapPin, Building2, Shield, CheckCircle, 
  Calendar, Briefcase, DollarSign, Home, Star, BarChart3
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
      case "good": return "Pháp lý đầy đủ";
      case "warning": return "Cần xem xét";
      case "danger": return "Có rủi ro";
      default: return "Chưa xác định";
    }
  };

  const quickStats = [
    {
      icon: DollarSign,
      label: "Giá/m²",
      value: `${formatCurrency(project.pricePerSqm)}`,
      gradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Building2,
      label: "Tầng cao",
      value: `${project.floors || 'N/A'}`,
      gradient: "from-slate-50 to-slate-100/50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600"
    },
    {
      icon: Home,
      label: "Căn hộ",
      value: `${project.totalUnits || 'N/A'}`,
      gradient: "from-indigo-50 to-indigo-100/50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Star,
      label: "Đánh giá",
      value: `${project.legalScore}/10`,
      gradient: "from-amber-50 to-amber-100/50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <div className="relative">
      {/* Background Image with Soft Overlay */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/60 to-slate-900/85" />
        </div>

        {/* Floating Navigation Bar */}
        <div className="absolute top-6 left-6 right-6 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-slate-700 hover:text-primary hover:bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex gap-2 flex-wrap">
              <SocialShare
                url={window.location.href}
                title={project.name}
                description={`Xem dự án ${project.name} tại ${project.location}`}
                variant="outline"
                size="sm"
              />
              <PriceAlertDialog
                projectId={project.id}
                projectName={project.name}
                currentPrice={project.pricePerSqm}
              />
              <AppointmentBookingDialog
                projectId={project.id}
                projectName={project.name}
                triggerButton={
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt lịch
                  </Button>
                }
              />
              <AddToPortfolioDialog
                projectId={project.id}
                projectName={project.name}
                currentPrice={project.pricePerSqm}
                triggerButton={
                  <Button variant="outline" size="sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                }
              />
              <FavoriteButton
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end z-30 pt-28">
          <div className="container mx-auto px-6 pb-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge 
                  variant={getStatusVariant(project.status)} 
                  className="px-4 py-2 text-xs font-semibold rounded-full shadow-lg"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {getStatusText(project.status)}
                </StatusBadge>
                {project.completionDate === "Đã hoàn thành" && (
                  <Badge className="bg-success text-white border-0 px-4 py-2 text-xs font-semibold rounded-full shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Đã bàn giao
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {project.name}
              </h1>

              <div className="flex flex-wrap gap-4 text-white/90 text-sm md:text-base mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const developerId = project.developer.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/developers/${developerId}`);
                  }}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{project.developer}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickStats.map((stat, index) => (
                  <div 
                    key={index}
                    className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300`}
                  >
                    <div className={`${stat.iconBg} ${stat.iconColor} w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 shadow-sm`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-600 mb-1 font-medium">{stat.label}</div>
                    <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};