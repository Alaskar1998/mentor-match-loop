import React from 'react';
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Horizontal Navigation */}
      <div>
        <DashboardSidebar />
      </div>
      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};