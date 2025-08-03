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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import '@/i18n'; // Import to initialize i18n

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const RequestsFeed = lazy(() => import("./pages/RequestsFeed"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const MyExchanges = lazy(() => import("./pages/MyExchanges"));
const Gamification = lazy(() => import("./pages/Gamification"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfUse />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/contact" element={<ContactSupport />} />
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
                  </Suspense>
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
  </ErrorBoundary>
);

export default App;
