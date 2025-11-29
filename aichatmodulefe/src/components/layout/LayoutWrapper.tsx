'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Start as mobile to avoid hydration issues

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, close sidebar by default
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    // Check on mount
    if (typeof window !== 'undefined') {
      checkMobile();
    }

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setIsCollapsed(collapsed);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onClose={closeSidebar}
        onCollapse={handleCollapse}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isMobile ? '' : isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Navbar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
