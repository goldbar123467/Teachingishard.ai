"use client";

import * as React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useActiveTab } from "@/hooks/useActiveTab";

interface MainLayoutProps {
  children: React.ReactNode;
  onSaveClick?: () => void;
}

export function MainLayout({ children, onSaveClick }: MainLayoutProps) {
  // Track active tab for persistence
  useActiveTab();

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader onSaveClick={onSaveClick} />
        <main className="flex-1 overflow-auto relative">
          {/* Ambient background glow for game atmosphere */}
          <div className="ambient-glow" aria-hidden="true" />
          <div className="mesh-gradient-subtle min-h-[calc(100vh-3.5rem)] relative z-[1]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
