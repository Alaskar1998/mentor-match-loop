import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GamificationProvider } from "@/hooks/useGamification";
import { MonetizationProvider } from "@/hooks/useMonetization";
import { NotificationProvider } from "@/hooks/useNotifications";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import SearchResults from "./pages/SearchResults";
import { CreateRequest } from "./pages/CreateRequest";
import { RequestsFeed } from "./pages/RequestsFeed";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Messages from "./pages/Messages";
import Chats from "./pages/dashboard/Chats";
import Invites from "./pages/dashboard/Invites";
import Reviews from "./pages/dashboard/Reviews";
import Gamification from "./pages/dashboard/Gamification";
import Events from "./pages/dashboard/Events";
import ProfileView from "./pages/ProfileView";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <GamificationProvider>
            <MonetizationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/create-request" element={<CreateRequest />} />
                <Route path="/requests-feed" element={<RequestsFeed />} />
                <Route path="/chat/:chatId" element={<Chat />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/dashboard" element={
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/messages" element={
                  <DashboardLayout>
                    <Messages />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/profile" element={
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/chats" element={
                  <DashboardLayout>
                    <Chats />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/invites" element={
                  <DashboardLayout>
                    <Invites />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/reviews" element={
                  <DashboardLayout>
                    <Reviews />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/gamification" element={
                  <DashboardLayout>
                    <Gamification />
                  </DashboardLayout>
                } />
                <Route path="/dashboard/events" element={
                  <DashboardLayout>
                    <Events />
                  </DashboardLayout>
                } />
                <Route path="/profile/:id" element={<ProfileView />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        </MonetizationProvider>
        </GamificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
