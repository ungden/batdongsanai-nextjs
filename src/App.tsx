import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import SEOProvider from "@/components/seo/SEOProvider";
import { ANALYTICS_CONFIG, isAnalyticsEnabled } from "@/config/analytics";
import { ErrorBoundary, PageLoadingSkeleton } from "@/components/common";

import { Suspense, lazy } from "react";

// Core Pages - Lazy loaded with preload hints
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Discovery & Browsing Pages
const Explore = lazy(() => import("./pages/Explore"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ProjectAnalysis = lazy(() => import("./pages/ProjectAnalysis"));
const Compare = lazy(() => import("./pages/Compare"));

// Developers
const Developers = lazy(() => import("./pages/Developers"));
const DeveloperDetail = lazy(() => import("./pages/DeveloperDetail"));

// Tools & Calculators
const Calculator = lazy(() => import("./pages/Calculator"));
const AdvancedCalculator = lazy(() => import("./pages/AdvancedCalculator"));
const LegalMatrix = lazy(() => import("./pages/LegalMatrix"));
const DocumentAnalysis = lazy(() => import("./pages/DocumentAnalysis"));

// Market Intelligence
const MarketOverview = lazy(() => import("./pages/MarketOverview"));
const MarketIntelligence = lazy(() => import("./pages/MarketIntelligence"));
const ProjectProgress = lazy(() => import("./pages/ProjectProgress"));
const ProjectAnalysisHub = lazy(() => import("./pages/ProjectAnalysisHub"));

// User Pages
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Appointments = lazy(() => import("./pages/Appointments"));

// Marketplace
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const CreateListing = lazy(() => import("./pages/CreateListing"));

// Content
const News = lazy(() => import("./pages/News"));

// Admin Pages - All lazy loaded
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const ApprovalCenter = lazy(() => import("@/pages/admin/ApprovalCenter"));
const ResearchFactory = lazy(() => import("@/pages/admin/ResearchFactory"));
const MarketResearchFactory = lazy(() => import("@/pages/admin/MarketResearchFactory"));
const CatalystFactory = lazy(() => import("@/pages/admin/CatalystFactory"));
const ContentStudio = lazy(() => import("@/pages/admin/ContentStudio"));
const DataManagement = lazy(() => import("@/pages/admin/DataManagement"));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/AnalyticsDashboard"));
const LeadManagement = lazy(() => import("@/pages/admin/LeadManagement"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const AdminDevelopers = lazy(() => import("@/pages/admin/AdminDevelopers"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminLogsPage = lazy(() => import("@/pages/admin/AdminLogs"));
const AdminNews = lazy(() => import("@/pages/admin/AdminNews"));
const AiProjectScout = lazy(() => import("@/pages/admin/AiProjectScout"));
const ProjectPipeline = lazy(() => import("@/pages/admin/ProjectPipeline"));
const ProjectWorkspace = lazy(() => import("@/pages/admin/ProjectWorkspace"));

// React Query configuration with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Loading fallbacks for different page types
const DefaultLoading = () => <PageLoadingSkeleton type="default" />;
const ListLoading = () => <PageLoadingSkeleton type="list" />;
const DetailLoading = () => <PageLoadingSkeleton type="detail" />;
const DashboardLoading = () => <PageLoadingSkeleton type="dashboard" />;

// Wrapper component for suspense with appropriate loading type
const SuspenseWrapper = ({
  children,
  type = 'default'
}: {
  children: React.ReactNode;
  type?: 'default' | 'list' | 'detail' | 'dashboard';
}) => {
  const LoadingComponent = {
    default: DefaultLoading,
    list: ListLoading,
    detail: DetailLoading,
    dashboard: DashboardLoading,
  }[type];

  return (
    <Suspense fallback={<LoadingComponent />}>
      {children}
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <SEOProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              {isAnalyticsEnabled() && (
                <GoogleAnalytics trackingId={ANALYTICS_CONFIG.GA_TRACKING_ID} />
              )}
              <BrowserRouter>
                <Suspense fallback={<DefaultLoading />}>
                  <Routes>
                    {/* Core Routes */}
                    <Route path="/" element={
                      <SuspenseWrapper>
                        <Home />
                      </SuspenseWrapper>
                    } />
                    <Route path="/auth" element={
                      <SuspenseWrapper>
                        <Auth />
                      </SuspenseWrapper>
                    } />

                    {/* Discovery Routes */}
                    <Route path="/explore" element={
                      <SuspenseWrapper type="list">
                        <Explore />
                      </SuspenseWrapper>
                    } />
                    <Route path="/projects" element={
                      <SuspenseWrapper type="list">
                        <Projects />
                      </SuspenseWrapper>
                    } />
                    <Route path="/projects/:id" element={
                      <SuspenseWrapper type="detail">
                        <ProjectDetail />
                      </SuspenseWrapper>
                    } />
                    <Route path="/projects/:id/analysis" element={
                      <SuspenseWrapper type="detail">
                        <ProjectAnalysis />
                      </SuspenseWrapper>
                    } />
                    <Route path="/compare" element={
                      <SuspenseWrapper type="detail">
                        <Compare />
                      </SuspenseWrapper>
                    } />

                    {/* Developers Routes */}
                    <Route path="/developers" element={
                      <SuspenseWrapper type="list">
                        <Developers />
                      </SuspenseWrapper>
                    } />
                    <Route path="/developers/:developerId" element={
                      <SuspenseWrapper type="detail">
                        <DeveloperDetail />
                      </SuspenseWrapper>
                    } />

                    {/* Tools Routes */}
                    <Route path="/calculator" element={
                      <SuspenseWrapper>
                        <Calculator />
                      </SuspenseWrapper>
                    } />
                    <Route path="/calculator/advanced" element={
                      <SuspenseWrapper>
                        <AdvancedCalculator />
                      </SuspenseWrapper>
                    } />
                    <Route path="/legal-matrix" element={
                      <SuspenseWrapper>
                        <LegalMatrix />
                      </SuspenseWrapper>
                    } />
                    <Route path="/document-analysis" element={
                      <SuspenseWrapper>
                        <DocumentAnalysis />
                      </SuspenseWrapper>
                    } />

                    {/* Market Intelligence Routes */}
                    <Route path="/market-overview" element={
                      <SuspenseWrapper type="dashboard">
                        <MarketOverview />
                      </SuspenseWrapper>
                    } />
                    <Route path="/market-intelligence" element={
                      <SuspenseWrapper type="dashboard">
                        <MarketIntelligence />
                      </SuspenseWrapper>
                    } />
                    <Route path="/project-progress" element={
                      <SuspenseWrapper type="detail">
                        <ProjectProgress />
                      </SuspenseWrapper>
                    } />
                    <Route path="/project-analysis" element={
                      <SuspenseWrapper type="detail">
                        <ProjectAnalysisHub />
                      </SuspenseWrapper>
                    } />

                    {/* User Routes */}
                    <Route path="/profile" element={
                      <SuspenseWrapper>
                        <Profile />
                      </SuspenseWrapper>
                    } />
                    <Route path="/favorites" element={
                      <SuspenseWrapper type="list">
                        <Favorites />
                      </SuspenseWrapper>
                    } />
                    <Route path="/portfolio" element={
                      <SuspenseWrapper type="dashboard">
                        <Portfolio />
                      </SuspenseWrapper>
                    } />
                    <Route path="/appointments" element={
                      <SuspenseWrapper type="list">
                        <Appointments />
                      </SuspenseWrapper>
                    } />

                    {/* Marketplace Routes */}
                    <Route path="/marketplace" element={
                      <SuspenseWrapper type="list">
                        <Marketplace />
                      </SuspenseWrapper>
                    } />
                    <Route path="/marketplace/listing/:id" element={
                      <SuspenseWrapper type="detail">
                        <ListingDetail />
                      </SuspenseWrapper>
                    } />
                    <Route path="/marketplace/create" element={
                      <SuspenseWrapper>
                        <CreateListing />
                      </SuspenseWrapper>
                    } />

                    {/* Content Routes */}
                    <Route path="/news" element={
                      <SuspenseWrapper type="list">
                        <News />
                      </SuspenseWrapper>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <SuspenseWrapper type="dashboard">
                        <AdminLayout />
                      </SuspenseWrapper>
                    }>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="approvals" element={<ApprovalCenter />} />
                      <Route path="leads" element={<LeadManagement />} />

                      {/* Workflow Routes */}
                      <Route path="pipeline" element={<ProjectPipeline />} />
                      <Route path="enrichment" element={<Navigate to="/admin/pipeline" replace />} />
                      <Route path="enrichment/:id" element={<ProjectWorkspace />} />

                      {/* AI Tools */}
                      <Route path="ai-scout" element={<AiProjectScout />} />
                      <Route path="research-factory" element={<ResearchFactory />} />
                      <Route path="market-research-factory" element={<MarketResearchFactory />} />
                      <Route path="catalyst-factory" element={<CatalystFactory />} />
                      <Route path="content-studio" element={<ContentStudio />} />

                      {/* Data & Analytics */}
                      <Route path="data-management" element={<DataManagement />} />
                      <Route path="analytics" element={<AnalyticsDashboard />} />

                      {/* Management Pages */}
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="projects" element={<AdminProjects />} />
                      <Route path="developers" element={<AdminDevelopers />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="logs" element={<AdminLogsPage />} />
                      <Route path="news" element={<AdminNews />} />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={
                      <SuspenseWrapper>
                        <NotFound />
                      </SuspenseWrapper>
                    } />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SEOProvider>
  </ErrorBoundary>
);

export default App;
