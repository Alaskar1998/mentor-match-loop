import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useTranslation } from "react-i18next";

interface AdminLayoutProps {
  title?: string;
}

const AdminLayout = ({ title = "Admin Dashboard" }: AdminLayoutProps) => {
  const { user, isAuthenticated, isLoading, isSessionRestoring } = useAuth();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Check if user has admin role
    setIsAdmin(user.role === 'admin');
  }, [user]);

  // Show loading while checking auth and admin status
  if (isLoading || isSessionRestoring || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">
            {t('admin.accessDenied.title', 'Access Denied')}
          </h1>
          <p className="text-muted-foreground max-w-md">
            {t('admin.accessDenied.message', 'You do not have permission to access the admin dashboard.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar title={title} />
        
        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 