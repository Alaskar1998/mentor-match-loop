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
import SearchResults from "./pages/SearchResults";
import { CreateRequest } from "./pages/CreateRequest";
import { RequestsFeed } from "./pages/RequestsFeed";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/requests-feed" element={<RequestsFeed />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/dashboard" element={
              <DashboardLayout>
                <Dashboard />
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
        </BrowserRouter>
        </MonetizationProvider>
        </GamificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
