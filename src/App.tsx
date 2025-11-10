import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NewReport from "./pages/NewReport";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ReportDetail from "./pages/ReportDetail";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import DashboardReports from "./pages/DashboardReports";
import DashboardReportDetail from "./pages/DashboardReportDetail";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import AuthorityDashboard from "./pages/AuthorityDashbord";
import NotFound from "./pages/NotFound";

// Lazy load Map pour éviter les problèmes de chargement
const Map = lazy(() => import("./pages/Map"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-report" element={<NewReport />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route 
            path="/map" 
            element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
                <Map />
              </Suspense>
            } 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/reports" element={<DashboardReports />} />
          <Route path="/dashboard/reports/:id" element={<DashboardReportDetail />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
