"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Shield, Home, DollarSign, Activity, FileText, Crown,
  BarChart3, AlertTriangle, Eye, Info, Building2, Users, Calendar, Star,
  Calculator, Loader2
} from "lucide-react";
import { useProjectDetail } from "@/hooks/useProjects";
import { useProjectViews } from "@/hooks/useProjectViews";
import { usePermissions } from "@/hooks/usePermissions";
import ImprovedConsultationForm from "@/components/consultation/ImprovedConsultationForm";
import AnalysisButton from "@/components/project/AnalysisButton";
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
import { ProjectHero } from "@/components/project/detail/ProjectHero";
import { formatCurrency } from "@/utils/formatCurrency";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackView } = useProjectViews();
  const { isVIP } = usePermissions();
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { project, loading } = useProjectDetail(id);

  useEffect(() => {
    if (project) {
      trackView(project.id);
    }
  }, [project?.id, trackView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Không tìm thấy dự án</h1>
          <Button onClick={() => navigate('/projects')} className="rounded-xl">
            Quay lại danh sách dự án
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: "Trang chủ", url: "/" },
    { name: "Dự án", url: "/projects" },
    { name: project.name, url: `/projects/${project.id}` }
  ];

  const projectSchema = generateRealEstateSchema(project);
  
  const faqData = [
    {
      question: `Dự án ${project.name} có pháp lý rõ ràng không?`,
      answer: `Dự án có điểm pháp lý ${project.legalScore}/10. ${project.warnings.length > 0 ? `Có ${project.warnings.length} cảnh báo cần lưu ý.` : 'Hiện tại không có cảnh báo đáng chú ý.'}`
    },
    {
      question: `Giá bán ${project.name} như thế nào?`,
      answer: `Giá bán dự án dao động ${project.priceRange} với mức giá trung bình ${formatCurrency(project.pricePerSqm)} VNĐ/m².`
    },
    {
      question: `Khi nào ${project.name} hoàn thành?`,
      answer: `Dự án dự kiến hoàn thành vào ${project.completionDate}.`
    }
  ];

  const faqSchema = generateFAQSchema(faqData);

  const handleCalculate = () => {
    navigate(`/calculator?price=${project.pricePerSqm}&area=70`);
  };

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

      {/* Use clean background in light mode, darker in dark mode */}
      <div className="min-h-screen bg-slate-50/50 dark:bg-background">
        <ProjectHero project={project} />

        <div className="container mx-auto px-4 md:px-6 py-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Price Card - Clean & Elevated */}
              <Card className="card-elevated border-primary/10 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-400" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1 font-medium">Giá bán dự án</div>
                      <div className="text-3xl md:text-4xl font-bold text-foreground mb-1 tracking-tight">
                        {project.priceRange}
                      </div>
                      <div className="text-base text-muted-foreground font-medium">
                        ~{formatCurrency(project.pricePerSqm)} /m²
                      </div>
                    </div>
                    <div className="text-right">
                      <Button 
                        onClick={handleCalculate}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                      >
                        <Calculator className="w-5 h-5 mr-2" />
                        Tính toán vay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VIP Analysis CTA - Modern Gradient */}
              <Card className="rounded-2xl shadow-strong border border-white/20 dark:border-border overflow-hidden relative bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <CardContent className="relative p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <h3 className="text-xl font-bold">Báo cáo phân tích chuyên sâu</h3>
                        {!isVIP && <Crown className="w-5 h-5 text-yellow-300 animate-pulse" />}
                      </div>
                      <p className="text-blue-100 text-sm mb-4 leading-relaxed max-w-lg">
                        Mở khóa dữ liệu: Phân tích dòng tiền, pháp lý chi tiết, quy hoạch hạ tầng và rủi ro tiềm ẩn.
                      </p>
                      <AnalysisButton projectId={project.id} className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-blue-50 border-0 font-bold shadow-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <Card className="overflow-hidden rounded-2xl shadow-medium border-0">
                  <ProjectImageGallery gallery={project.gallery} projectName={project.name} />
                </Card>
              )}

              {/* Main Content Tabs */}
              <Card className="rounded-2xl shadow-medium border-border bg-card overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-border bg-muted/20">
                    <TabsList className="w-full h-auto p-2 bg-transparent justify-start overflow-x-auto no-scrollbar gap-2">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 font-semibold text-sm transition-all">
                        <Info className="w-4 h-4 mr-2" /> Tổng quan
                      </TabsTrigger>
                      <TabsTrigger value="market" className="data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 font-semibold text-sm transition-all">
                        <TrendingUp className="w-4 h-4 mr-2" /> Thị trường
                      </TabsTrigger>
                      <TabsTrigger value="legal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 font-semibold text-sm transition-all">
                        <Shield className="w-4 h-4 mr-2" /> Pháp lý
                      </TabsTrigger>
                      <TabsTrigger value="payment" className="data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 font-semibold text-sm transition-all">
                        <DollarSign className="w-4 h-4 mr-2" /> Thanh toán
                      </TabsTrigger>
                      <TabsTrigger value="progress" className="data-[state=active]:bg-white dark:data-[state=active]:bg-muted data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 font-semibold text-sm transition-all">
                        <Activity className="w-4 h-4 mr-2" /> Tiến độ
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6 bg-card">
                    <TabsContent value="overview" className="mt-0 space-y-8 animate-fade-in">
                      <ProjectOverview
                        project={project}
                        onConsultationClick={() => setShowConsultationForm(true)}
                      />
                      <ProjectComparison currentProject={project} />
                      <RiskAnalysis project={project} />
                      <LocationAnalysis
                        projectName={project.name}
                        location={project.location}
                        district={project.district}
                        city={project.city}
                      />
                       <ProjectReviews
                        projectId={project.id}
                        projectName={project.name}
                      />
                    </TabsContent>

                    <TabsContent value="market" className="mt-0 space-y-8 animate-fade-in">
                      <StockStyleDashboard
                        projectId={project.id}
                        projectName={project.name}
                        currentPrice={project.pricePerSqm}
                      />
                       <PriceHistoryChart
                        priceHistory={project.priceHistory || []}
                        launchPrice={project.launchPrice}
                        currentPrice={project.currentPrice || project.pricePerSqm}
                        projectName={project.name}
                      />
                      <PricingInsights
                        projectId={project.id}
                        currentPrice={project.pricePerSqm}
                      />
                      <RentalYieldAnalysis
                        projectId={project.id}
                        purchasePrice={project.pricePerSqm * 70}
                      />
                    </TabsContent>

                    <TabsContent value="legal" className="mt-0 animate-fade-in">
                      <ProjectLegalTab project={project} />
                    </TabsContent>

                    <TabsContent value="payment" className="mt-0 space-y-8 animate-fade-in">
                      <ProjectPaymentTab project={project} />
                      <ROICalculator
                        pricePerSqm={project.pricePerSqm}
                        averageRentalPrice={project.averageRentalPrice}
                        rentalYield={project.rentalYield}
                        projectName={project.name}
                      />
                      <PaymentPoliciesCard projectId={project.id} />
                    </TabsContent>

                    <TabsContent value="progress" className="mt-0 space-y-8 animate-fade-in">
                      <ProjectProgressTab project={project} />
                      <ProjectTimeline
                        completionDate={project.completionDate}
                        soldUnits={project.soldUnits}
                        totalUnits={project.totalUnits}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>

              {/* FAQ Section */}
              <Card className="rounded-2xl shadow-medium border-border bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
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
              <div className="sticky top-24 space-y-6">
                {/* Agents Section */}
                <ProjectAgents projectId={project.id} projectName={project.name} />

                {/* Key Metrics */}
                <Card className="card-elevated border-border/60">
                  <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-foreground">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Chỉ số quan trọng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <span className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Star className="w-4 h-4" />
                        Điểm pháp lý
                      </span>
                      <span className="font-black text-xl text-blue-700 dark:text-blue-400">{project.legalScore}/10</span>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: "Số tầng", value: project.floors || 'N/A', icon: Building2 },
                        { label: "Tổng căn hộ", value: project.totalUnits || 'N/A', icon: Home },
                        { label: "Đã bán", value: project.soldUnits || 'N/A', icon: Users },
                        { label: "Bàn giao", value: project.completionDate, icon: Calendar }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                          <span className="text-sm flex items-center gap-2.5 text-muted-foreground font-medium">
                            <item.icon className="w-4 h-4 opacity-70" />
                            {item.label}
                          </span>
                          <span className="font-semibold text-foreground text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Warnings */}
                {project.warnings.length > 0 && (
                  <Card className="card-elevated border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10">
                    <CardHeader className="pb-3 border-b border-amber-100/50 dark:border-amber-900/30">
                      <CardTitle className="text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Cảnh báo pháp lý
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {project.warnings.slice(0, 3).map((warning, index) => (
                        <div key={index} className="flex items-start gap-2.5 p-3 bg-white/60 dark:bg-black/20 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0 shadow-sm" />
                          <span className="text-sm leading-relaxed text-amber-900 dark:text-amber-200/90 font-medium">{warning}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
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