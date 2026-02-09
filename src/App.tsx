import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import LandingPage from "./pages/LandingPage";
import ClassCouncilLanding from "./pages/ClassCouncilLanding";
import ReportCardLanding from "./pages/ReportCardLanding";
import Index from "./pages/Index";
import ReportCardAI from "./pages/ReportCardAI";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Pricing from "./pages/Pricing";
import PromoCodesAdmin from "./pages/admin/PromoCodesAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthModal />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Landing/Marketing pages for each tool */}
            <Route path="/classcouncil-ai" element={<ClassCouncilLanding />} />
            <Route path="/reportcard-ai" element={<ReportCardLanding />} />
            {/* Actual application pages */}
            <Route path="/classcouncil-ai/app" element={<Index />} />
            <Route path="/reportcard-ai/app" element={<ReportCardAI />} />
            {/* Pricing page */}
            <Route path="/pricing" element={<Pricing />} />
            {/* Admin pages */}
            <Route path="/admin/promo-codes" element={<PromoCodesAdmin />} />
            {/* Legal pages */}
            <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
