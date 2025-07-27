import React from 'react';
import { 
  Users, 
  Mail, 
  Settings, 
  Coins
} from 'lucide-react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const dashboardItems = [
  { title: "Profile", url: "/profile", icon: Settings },
  { title: "Invites", url: "/dashboard/invites", icon: Mail },
  { title: "Coins & Badges", url: "/dashboard/gamification", icon: Coins },
];

export function DashboardSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center px-4 py-2">
        <div className="flex-1 flex justify-evenly items-center">
          {dashboardItems.map((item) => (
            <NavLink 
              key={item.title} 
              to={item.url} 
              end 
              className={getNavCls}
            >
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span className="flex items-center gap-1">
                  {item.title}
                </span>
              </Button>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}