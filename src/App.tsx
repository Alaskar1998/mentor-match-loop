import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GamificationProvider } from "@/hooks/useGamification";
import { MonetizationProvider } from "@/hooks/useMonetization";
import { NotificationProvider } from "@/hooks/useNotifications";
import { LanguageProvider } from "@/hooks/useLanguage";
import '@/i18n'; // Import to initialize i18n
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import SearchResults from "./pages/SearchResults";

import RequestsFeed from "./pages/RequestsFeed";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ProfileView from "./pages/ProfileView";
import MyExchanges from "./pages/MyExchanges";
import Gamification from "./pages/Gamification";
import NotFound from "./pages/NotFound";

function DashboardInvitesRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");
  let to = "/my-exchanges";
  if (tab) {
    to += `?tab=${tab}`;
  }
  return <Navigate to={to} replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            {/* Temporarily disabled for performance optimization */}
            {/* <GamificationProvider> */}
              <MonetizationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/requests-feed" element={<RequestsFeed />} />
                  <Route path="/chat/:chatId" element={<Chat />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/my-exchanges" element={<MyExchanges />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<ProfileView />} />
                  <Route path="/gamification" element={<Gamification />} />
                  {/* Redirect old dashboard/invites?tab=... to /my-exchanges?tab=... */}
                  <Route path="/dashboard/invites" element={<DashboardInvitesRedirect />} />
                  <Route path="/dashboard/messages" element={<MyExchanges />} />
                  <Route path="/dashboard" element={<MyExchanges />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
          </MonetizationProvider>
          {/* </GamificationProvider> */}
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
