import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { layout } from "../../design/layout";
import { PageTransition } from "../../design/components/PageTransition";

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { refreshUser, token } = useAuth();

  useEffect(() => {
    if (token) {
      void refreshUser();
    }
  }, [token, refreshUser]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-ds-canvas relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full bg-ds-primary/20 blur-[120px] -top-32 -left-32 opacity-30"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] rounded-full bg-ds-accent/15 blur-[120px] right-[-200px] top-1/3 opacity-25"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[400px] rounded-full bg-ds-primary-700/10 blur-[100px] bottom-[-100px] left-1/3 opacity-20"
        />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={cn(
          "relative transition-all duration-300 min-h-screen flex flex-col",
          sidebarCollapsed ? `ml-[${layout.sidebar.collapsed}px]` : `ml-[${layout.sidebar.expanded}px]`
        )}
        style={{
          marginLeft: sidebarCollapsed ? layout.sidebar.collapsed : layout.sidebar.expanded,
        }}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <PageTransition mode="slide">
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
