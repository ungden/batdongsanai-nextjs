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

import { Suspense, lazy } from "react";
import Home from "./pages/Home";

import Explore from "./pages/Explore";
import Projects from "./pages/Projects";
import Calculator from "./pages/Calculator";
import Profile from "./pages/Profile";
import LegalMatrix from "./pages/LegalMatrix";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import News from "./pages/News";
import NotFound from "./pages/NotFound";

// Lazy load heavy components for better performance
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ProjectAnalysis = lazy(() => import("./pages/ProjectAnalysis"));
const DocumentAnalysis = lazy(() => import("./pages/DocumentAnalysis"));
const ProjectProgress = lazy(() => import("./pages/ProjectProgress"));
const MarketOverview = lazy(() => import("./pages/MarketOverview"));
const DeveloperDetail = lazy(() => import("./pages/DeveloperDetail"));
const Developers = lazy(() => import("./pages/Developers"));
const ProjectAnalysisHub = lazy(() => import("./pages/ProjectAnalysisHub"));

// Admin Pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ResearchFactory = lazy(() => import('@/pages/admin/ResearchFactory'));
const MarketResearchFactory = lazy(() => import('@/pages/admin/MarketResearchFactory'));
const CatalystFactory = lazy(() => import('@/pages/admin/CatalystFactory'));
const ContentStudio = lazy(() => import('@/pages/admin/ContentStudio')); // New
const DataManagement = lazy(() => import('@/pages/admin/DataManagement'));
const AnalyticsDashboard = lazy(() => import('@/pages/admin/AnalyticsDashboard'));
const LeadManagement = lazy(() => import('@/pages/admin/LeadManagement'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminDevelopers = lazy(() => import('@/pages/admin/AdminDevelopers'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminLogsPage = lazy(() => import('@/pages/admin/AdminLogs'));
const AdminNews = lazy(() => import('@/pages/admin/AdminNews'));

// New Feature Pages
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Appointments = lazy(() => import('./pages/Appointments'));
const MarketIntelligence = lazy(() => import('./pages/MarketIntelligence'));
const Compare = lazy(() => import('./pages/Compare'));
const AdvancedCalculator = lazy(() => import('./pages/AdvancedCalculator'));

// Marketplace Pages
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
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
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/explore" element={<Explore />} />
              
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/analysis" element={<ProjectAnalysis />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/calculator/advanced" element={<AdvancedCalculator />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/market-intelligence" element={<MarketIntelligence />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/listing/:id" element={<ListingDetail />} />
              <Route path="/marketplace/create" element={<CreateListing />} />
              <Route path="/news" element={<News />} />
              <Route path="/legal-matrix" element={<LegalMatrix />} />
              <Route path="/document-analysis" element={<DocumentAnalysis />} />
              <Route path="/project-progress" element={<ProjectProgress />} />
              <Route path="/market-overview" element={<MarketOverview />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/developers/:developerId" element={<DeveloperDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="leads" element={<LeadManagement />} />
                <Route path="data-management" element={<DataManagement />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                
                {/* AI Tools */}
                <Route path="research-factory" element={<ResearchFactory />} />
                <Route path="market-research-factory" element={<MarketResearchFactory />} />
                <Route path="catalyst-factory" element={<CatalystFactory />} />
                <Route path="content-studio" element={<ContentStudio />} /> {/* New Route */}
                
                {/* Functional Admin Pages */}
                <Route path="users" element={<AdminUsers />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="developers" element={<AdminDevelopers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="logs" element={<AdminLogsPage />} />
                <Route path="news" element={<AdminNews />} />
              </Route>
              
              <Route path="/project-analysis" element={<ProjectAnalysisHub />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </SEOProvider>
);

export default App;