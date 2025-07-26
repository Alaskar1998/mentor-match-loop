import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Star, 
  Settings, 
  Coins,
  Trophy,
  MapPin,
  Calendar,
  Zap,
  Crown
} from 'lucide-react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const dashboardItems = [
  { title: "Overview", url: "/dashboard", icon: Users },
  { title: "Profile", url: "/dashboard/profile", icon: Settings },
  { title: "Chats", url: "/messages", icon: MessageSquare },
  { title: "Invites", url: "/dashboard/invites", icon: Mail },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Coins & Badges", url: "/dashboard/gamification", icon: Coins },
  { title: "Events", url: "/dashboard/events", icon: Calendar, premiumOnly: true },
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
                  {item.premiumOnly && (
                    <Trophy className="w-3 h-3 text-yellow-500" />
                  )}
                </span>
              </Button>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}