import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip"; // Désactivé temporairement
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient } from "@/utils/queryOptimization";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import CreateAd from "./pages/CreateAd";
import Moderation from "./pages/Moderation";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import AdDetail from "./pages/AdDetail";
import Events from "./pages/Events";
import ParentalControl from "./pages/ParentalControl";
import Referral from "@/pages/Referral";
import UpdatePassword from "./pages/UpdatePassword";
import EmailTest from "./pages/EmailTest";
import EmailVerification from "./pages/EmailVerification";
import Rencontres from "./pages/Rencontres";
import Massages from "./pages/Massages";
import Produits from "./pages/Produits";
import Analytics from "./pages/Analytics";
import AdsterraTest from "./pages/AdsterraTest";
import RecaptchaTest from "./pages/RecaptchaTest";

import { PageTracker } from "@/components/analytics/PageTracker";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdNavigationDebugger from "@/components/debug/AdNavigationDebugger";

// Create optimized QueryClient
const queryClient = createOptimizedQueryClient();

// Component interne pour utiliser les hooks de performance
const AppContent = () => {
  // Désactivé pour éviter les erreurs de hooks
  // usePerformanceOptimization();

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="yamo-theme">
        {/* <TooltipProvider delayDuration={0}> */}
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/rencontres" element={<Rencontres />} />
              <Route path="/massages" element={<Massages />} />
              <Route path="/produits" element={<Produits />} />
              <Route path="/ad/:id" element={<AdDetail />} />
              <Route path="/create-ad" element={<CreateAd />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/moderation" element={<Moderation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/parental-control" element={<ParentalControl />} />
              <Route path="/events" element={<Events />} />
              <Route path="/email-test" element={<EmailTest />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/adsterra-test" element={<AdsterraTest />} />
              <Route path="/recaptcha-test" element={<RecaptchaTest />} />
              
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PageTracker />
            <AdNavigationDebugger />
          </div>
          <Toaster />
          <Sonner />
        {/* </TooltipProvider> */}
      </ThemeProvider>
    </BrowserRouter>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;