import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { GamificationProvider } from '@/hooks/useGamification';
import { MonetizationProvider } from '@/hooks/useMonetization';
import { NotificationProvider } from '@/hooks/useNotifications';
import { LanguageProvider } from '@/hooks/useLanguage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense, lazy, useState, useEffect } from 'react';
import '@/i18n'; // Import to initialize i18n

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const RequestsFeed = lazy(() => import('./pages/RequestsFeed'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const Messages = lazy(() => import('./pages/Messages'));
const ProfileView = lazy(() => import('./pages/ProfileView'));
const MyExchanges = lazy(() => import('./pages/MyExchanges'));
const Gamification = lazy(() => import('./pages/Gamification'));
const ContactSupport = lazy(() => import('./pages/ContactSupport'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TestPage = lazy(() => import('./pages/TestPage'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminInvitations = lazy(() => import('./pages/admin/Invitations'));
const AdminChats = lazy(() => import('./pages/admin/Chats'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));

import { Header } from './components/Header';
import { Footer } from './components/Footer';

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
  const tab = params.get('tab');
  let to = '/my-exchanges';
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <GamificationProvider>
              <MonetizationProvider>
                <NotificationProvider>
                  <ErrorBoundary>
                    <div className="min-h-screen flex flex-col overflow-x-hidden">
                      <Header />
                      <main className="flex-1 overflow-x-hidden">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Index />} />
                            <Route path="/test" element={<TestPage />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route
                              path="/privacy-policy"
                              element={<PrivacyPolicy />}
                            />
                            <Route
                              path="/terms-of-use"
                              element={<TermsOfUse />}
                            />
                            <Route path="/help" element={<Help />} />
                            <Route
                              path="/contact-support"
                              element={<ContactSupport />}
                            />

                            {/* Search and discovery */}
                            <Route path="/search" element={<SearchResults />} />
                            <Route
                              path="/requests-feed"
                              element={<RequestsFeed />}
                            />

                            {/* User profile and settings */}
                            <Route path="/profile" element={<Profile />} />
                            <Route
                              path="/profile/:id"
                              element={<ProfileView />}
                            />
                            <Route path="/settings" element={<Settings />} />

                            {/* Messaging and exchanges */}
                            <Route
                              path="/chat/:exchangeId"
                              element={<Chat />}
                            />
                            <Route path="/messages" element={<Messages />} />
                            <Route
                              path="/my-exchanges"
                              element={<MyExchanges />}
                            />

                            {/* Gamification */}
                            <Route
                              path="/gamification"
                              element={<Gamification />}
                            />

                            {/* Legacy redirects */}
                            <Route
                              path="/dashboard"
                              element={<DashboardInvitesRedirect />}
                            />
                            <Route
                              path="/dashboard/invites"
                              element={<DashboardInvitesRedirect />}
                            />

                            {/* Admin routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                              <Route index element={<AdminDashboard />} />
                              <Route path="users" element={<AdminUsers />} />
                              <Route
                                path="invitations"
                                element={<AdminInvitations />}
                              />
                              <Route path="chats" element={<AdminChats />} />
                              <Route
                                path="reviews"
                                element={<AdminReviews />}
                              />
                            </Route>

                            {/* Catch all route */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                    </div>
                    <Toaster />
                    <Sonner />
                  </ErrorBoundary>
                </NotificationProvider>
              </MonetizationProvider>
            </GamificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
