// src/components/layout/MainLayout.tsx
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from ".././context/AuthContext";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import LoadingScreen from "./LoadingScreen";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { loading } = useAuth();
  const [sidebarCompact, setSidebarCompact] = useState(true);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
          ${sidebarCompact ? "w-16" : "w-64"}
          bg-gradient-to-b from-white to-gray-50 border-r border-gray-200`}
        onMouseEnter={() => sidebarCompact && setSidebarCompact(false)}
        onMouseLeave={() => !sidebarCompact && setSidebarCompact(true)}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
            <Link to="/" className="flex items-center justify-center w-full">
              <Logo className="h-16" />
              {!sidebarCompact && (
                <span className="ml-2 text-md font-medium text-gray-700 transition-none">
                  Student Management Portal
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <Sidebar compact={sidebarCompact} />

          {/* User Profile */}
          <UserProfile compact={sidebarCompact} />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${
          sidebarCompact ? "pl-16" : "pl-64"
        } transition-all duration-300`}
      >
        <main className="p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
