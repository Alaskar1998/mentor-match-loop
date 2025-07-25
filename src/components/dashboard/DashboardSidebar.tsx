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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const dashboardItems = [
  { title: "Overview", url: "/dashboard", icon: Users },
  { title: "Profile", url: "/dashboard/profile", icon: Settings },
  { title: "Chats", url: "/dashboard/chats", icon: MessageSquare },
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
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="flex items-center gap-2">
                        {item.title}
                        {item.premiumOnly && (
                          <Trophy className="w-3 h-3 text-yellow-500" />
                        )}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Upgrade Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-4">
              <div className="bg-gradient-primary rounded-lg p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Upgrade to Premium</span>
                </div>
                <p className="text-sm text-white/80 mb-3">
                  Unlock unlimited exchanges and premium features
                </p>
                <Link to="/pricing">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}