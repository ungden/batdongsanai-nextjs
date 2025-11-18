"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, MapPin, Building2, Calendar, Phone, Star,
  Share2, Eye, TrendingUp, Award, Shield,
  Home, Ruler, DollarSign, Clock, Users, CheckCircle,
  AlertTriangle, Info, BarChart3, Activity, FileText, Crown,
  GitCompare, Calculator, Zap
} from "lucide-react";
import { projectsData } from "@/data/projectsData";
import { useProjectViews } from "@/hooks/useProjectViews";
import { usePermissions } from "@/hooks/usePermissions";
import ImprovedConsultationForm from "@/components/consultation/ImprovedConsultationForm";
import FavoriteButton from "@/components/project/FavoriteButton";
import AnalysisButton from "@/components/project/AnalysisButton";
import { SocialShare } from "@/components/SocialShare";
import { PriceAlertDialog } from "@/components/PriceAlertDialog";
import { AppointmentBookingDialog } from "@/components/AppointmentBookingDialog";
import { AddToPortfolioDialog } from "@/components/AddToPortfolioDialog";
import SEOHead from "@/components/seo/SEOHead";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { generateRealEstateSchema, generateFAQSchema } from "@/components/seo/SchemaMarkup";
import { FAQItem } from "@/components/ui/structured-content";
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectLegalTab from "@/components/project/ProjectLegalTab";
import ProjectPaymentTab from "@/components/project/ProjectPaymentTab";
import ProjectProgressTab from "@/components/project/ProjectProgressTab";
import ProjectImageGallery from "@/components/project/ProjectImageGallery";
import PriceHistoryChart from "@/components/project/PriceHistoryChart";
import ROICalculator from "@/components/project/ROICalculator";
import { PricingInsights } from "@/components/project/PricingInsights";
import { RentalYieldAnalysis } from "@/components/project/RentalYieldAnalysis";
import { PaymentPoliciesCard } from "@/components/project/PaymentPoliciesCard";
import { StockStyleDashboard } from "@/components/project/StockStyleDashboard";
import ProjectComparison from "@/components/project/ProjectComparison";
import ProjectTimeline from "@/components/project/ProjectTimeline";
import RiskAnalysis from "@/components/project/RiskAnalysis";
import LocationAnalysis from "@/components/project/LocationAnalysis";
import ProjectReviews from "@/components/project/ProjectReviews";
import { ProjectAgents } from "@/components/project/ProjectAgents";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackView } = useProjectViews();
  const { isVIP } = usePermissions();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const project = projectsData.find(p => p.id === id);

  useEffect(() => {
    if (project) {
      trackView(project.id);
    }
  }, [project?.id, trackView]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy dự án</h1>
          <Button onClick={() => navigate('/projects')} className="rounded-xl">
            Quay lại danh sách dự án
          </Button>
        </div>
      </div>
    );
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: `Xem dự án ${project.name} tại ${project.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã copy link dự án!");
    }
  };

  const breadcrumbItems = [
    { name: "Trang chủ", url: "/" },
    { name: "Dự án", url: "/projects" },
    { name: project.name, url: `/projects/${project.id}` }
  ];

  const projectSchema = generateRealEstateSchema(project);
  
  const faqData = [
    {
      question: `Dự án ${project.name} có pháp lý rõ ràng không?`,
      answer: `Dự án có điểm pháp lý ${project.legalScore}/10 với trạng thái: ${getStatusText(project.status)}. ${project.warnings.length > 0 ? `Có ${project.warnings.length} cảnh báo cần lưu ý.` : 'Hiện tại không có cảnh báo đáng chú ý.'}`
    },
    {
      question: `Giá bán ${project.name} như thế nào?`,
      answer: `Giá bán dự án dao động ${project.priceRange} với mức giá trung bình ${formatPrice(project.pricePerSqm)} VNĐ/m².`
    },
    {
      question: `Khi nào ${project.name} hoàn thành?`,
      answer: `Dự án dự kiến hoàn thành vào ${project.completionDate}.`
    }
  ];

  const faqSchema = generateFAQSchema(faqData);

  // Quick stats with subtle colors
  const quickStats = [
    {
      icon: DollarSign,
      label: "Giá/m²",
      value: `${formatPrice(project.pricePerSqm)}`,
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
    <>
      <SEOHead
        title={`${project.name} - Kiểm tra pháp lý | PropertyHub`}
        description={`Thông tin chi tiết pháp lý dự án ${project.name} tại ${project.location}. Giá ${project.priceRange}, điểm pháp lý ${project.legalScore}/10. Tư vấn miễn phí.`}
        keywords={`${project.name}, ${project.location}, ${project.developer}, bất động sản, pháp lý`}
        image={project.image}
        type="article"
        schema={[projectSchema, faqSchema]}
      />
      
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
        {/* Hero Section with Soft Design */}
        <div className="relative">
          {/* Background Image with Soft Overlay */}
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${project.image})` }}
            >
              {/* Soft gradient overlay */}
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
                  {/* Status Badges with Rounded Design */}
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

                  {/* Project Name */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                    {project.name}
                  </h1>

                  {/* Location & Developer */}
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

                  {/* Quick Stats - Soft Rounded Design */}
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

        {/* Main Content with Soft Backgrounds */}
        <div className="container mx-auto px-4 md:px-6 py-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Card - Soft Gradient */}
              <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-600 mb-1 font-medium">Giá bán dự án</div>
                      <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        {project.priceRange}
                      </div>
                      <div className="text-base text-slate-600">
                        {formatPrice(project.pricePerSqm)} VNĐ/m²
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {project.averageRentalPrice && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-slate-200/50">
                          <div className="text-xs text-slate-600 font-medium">Cho thuê/tháng</div>
                          <div className="text-lg font-bold text-slate-900">{project.averageRentalPrice}</div>
                        </div>
                      )}
                      {project.rentalYield && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 shadow-md border border-emerald-200/50">
                          <div className="text-xs text-emerald-700 font-medium">ROI dự kiến</div>
                          <div className="text-lg font-bold text-emerald-600">{project.rentalYield}%/năm</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VIP Analysis CTA */}
              <Card className="rounded-2xl shadow-lg border-2 border-primary/20 bg-gradient-to-br from-amber-50 via-orange-50/50 to-purple-50/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full blur-3xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">Báo cáo phân tích chuyên sâu</h3>
                        {!isVIP && <Crown className="w-5 h-5 text-amber-500" />}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        Phân tích tài chính, pháp lý, thị trường và kỹ thuật chi tiết
                      </p>
                      <AnalysisButton projectId={project.id} className="w-full md:w-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <Card className="overflow-hidden rounded-2xl shadow-lg border-0">
                  <ProjectImageGallery gallery={project.gallery} projectName={project.name} />
                </Card>
              )}

              {/* Price History Chart */}
              {project.priceHistory && project.priceHistory.length > 0 && (
                <PriceHistoryChart
                  priceHistory={project.priceHistory}
                  launchPrice={project.launchPrice}
                  currentPrice={project.currentPrice || project.pricePerSqm}
                  projectName={project.name}
                />
              )}

              {/* ROI Calculator */}
              <ROICalculator
                pricePerSqm={project.pricePerSqm}
                averageRentalPrice={project.averageRentalPrice}
                rentalYield={project.rentalYield}
                projectName={project.name}
              />

              {/* Project Comparison */}
              <ProjectComparison currentProject={project} />

              {/* Timeline */}
              <ProjectTimeline
                completionDate={project.completionDate}
                soldUnits={project.soldUnits}
                totalUnits={project.totalUnits}
              />

              {/* Risk Analysis */}
              <RiskAnalysis project={project} />

              {/* Location Analysis - NEW */}
              <LocationAnalysis
                projectName={project.name}
                location={project.location}
                district={project.district}
                city={project.city}
              />

              {/* Project Reviews - NEW */}
              <ProjectReviews
                projectId={project.id}
                projectName={project.name}
              />

              {/* Tabs Section - Soft Design */}
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30">
                    <TabsList className="w-full h-auto p-3 bg-transparent justify-start overflow-x-auto">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Tổng quan
                      </TabsTrigger>
                      <TabsTrigger
                        value="market"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Market Analysis</span>
                        <span className="sm:hidden">Market</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="legal"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Pháp lý
                      </TabsTrigger>
                      <TabsTrigger 
                        value="payment" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Thanh toán
                      </TabsTrigger>
                      <TabsTrigger
                        value="progress"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Tiến độ
                      </TabsTrigger>
                      <TabsTrigger
                        value="pricing"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Phân tích giá
                      </TabsTrigger>
                      <TabsTrigger
                        value="rental"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Cho thuê
                      </TabsTrigger>
                      <TabsTrigger
                        value="policies"
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-xl px-5 py-3 font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Chính sách TT
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="overview" className="mt-0">
                      <ProjectOverview
                        project={project}
                        onConsultationClick={() => setShowConsultationForm(true)}
                      />
                    </TabsContent>

                    <TabsContent value="market" className="mt-0">
                      <StockStyleDashboard
                        projectId={project.id}
                        projectName={project.name}
                        currentPrice={project.pricePerSqm}
                      />
                    </TabsContent>

                    <TabsContent value="legal" className="mt-0">
                      <ProjectLegalTab project={project} />
                    </TabsContent>
                    
                    <TabsContent value="payment" className="mt-0">
                      <ProjectPaymentTab project={project} />
                    </TabsContent>
                    
                    <TabsContent value="progress" className="mt-0">
                      <ProjectProgressTab project={project} />
                    </TabsContent>

                    <TabsContent value="pricing" className="mt-0">
                      <PricingInsights
                        projectId={project.id}
                        currentPrice={project.pricePerSqm}
                      />
                    </TabsContent>

                    <TabsContent value="rental" className="mt-0">
                      <RentalYieldAnalysis
                        projectId={project.id}
                        purchasePrice={project.pricePerSqm * 70}
                      />
                    </TabsContent>

                    <TabsContent value="policies" className="mt-0">
                      <PaymentPoliciesCard projectId={project.id} />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>

              {/* FAQ Section */}
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <Info className="w-5 h-5 text-primary" />
                    Câu hỏi thường gặp
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {faqData.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Agents Section - Lead Generation */}
                <ProjectAgents projectId={project.id} projectName={project.name} />

                {/* Key Metrics - Soft Design */}
                <Card className="rounded-2xl shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b border-slate-200/50 pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Chỉ số quan trọng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100">
                      <span className="text-sm font-medium flex items-center gap-2 text-slate-700">
                        <Star className="w-4 h-4 text-primary" />
                        Điểm pháp lý
                      </span>
                      <span className="font-bold text-xl text-primary">{project.legalScore}/10</span>
                    </div>
                    
                    {[
                      { label: "Số tầng", value: project.floors || 'N/A', icon: Building2 },
                      { label: "Tổng căn hộ", value: project.totalUnits || 'N/A', icon: Home },
                      { label: "Đã bán", value: project.soldUnits || 'N/A', icon: Users },
                      { label: "Bàn giao", value: project.completionDate, icon: Calendar }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl hover:shadow-md transition-all duration-200">
                        <span className="text-sm flex items-center gap-2 text-slate-700">
                          <item.icon className="w-4 h-4 text-slate-500" />
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Legal Warnings - Soft Design */}
                {project.warnings.length > 0 && (
                  <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50">
                    <CardHeader className="pb-3 border-b border-amber-200/50">
                      <CardTitle className="text-base text-amber-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Cảnh báo pháp lý
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {project.warnings.slice(0, 3).map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm leading-relaxed text-slate-700">{warning}</span>
                        </div>
                      ))}
                      {project.warnings.length > 3 && (
                        <div className="text-xs text-center py-2 text-amber-700 font-medium">
                          +{project.warnings.length - 3} cảnh báo khác
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* View Counter - Soft Design */}
                <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Lượt xem</span>
                      </div>
                      <span className="font-bold text-lg text-primary">
                        {Math.floor(Math.random() * 5000) + 1000}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Dialog */}
        <Dialog open={showConsultationForm} onOpenChange={setShowConsultationForm}>
          <DialogContent className="max-w-2xl mx-4 p-0 gap-0 max-h-[90vh] overflow-hidden rounded-2xl">
            <ImprovedConsultationForm 
              project={project} 
              onClose={() => setShowConsultationForm(false)}
            />
          </DialogContent>
        </Dialog>

        <BottomNavigation />
      </div>
    </>
  );
};

export default ProjectDetail;