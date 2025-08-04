import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Star, 
  Mail,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navigationItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: t('admin.sidebar.dashboard', 'Dashboard'),
    },
    {
      href: "/admin/users",
      icon: Users,
      label: t('admin.sidebar.users', 'Users'),
    },
    {
      href: "/admin/invitations",
      icon: Mail,
      label: t('admin.sidebar.invitations', 'Invitations'),
    },
    {
      href: "/admin/chats",
      icon: MessageSquare,
      label: t('admin.sidebar.chats', 'Chats'),
    },
    {
      href: "/admin/reviews",
      icon: Star,
      label: t('admin.sidebar.reviews', 'Reviews'),
    },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">
            {t('admin.sidebar.title', 'Admin Panel')}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}; 