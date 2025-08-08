// src/components/layout/Sidebar.tsx
import { useLocation } from "react-router-dom";
import { SIDEBAR_ITEMS } from "./config/sidebarConfig";
import SidebarItem from "./SidebarItem";
import { useState } from "react";

interface SidebarProps {
  compact: boolean;
}

const Sidebar = ({ compact }: SidebarProps) => {
  const location = useLocation();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <nav className="flex flex-col gap-2 py-4 px-2 relative">
      {SIDEBAR_ITEMS.map((item, idx) => (
        <div
          key={item.label}
          className={`relative ${compact ? "flex justify-center" : ""}`}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <SidebarItem {...item} compact={compact} />
          {compact && hoveredIdx === idx && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white shadow-lg rounded px-3 py-1 text-sm font-medium text-gray-700 z-10 whitespace-nowrap border border-gray-200">
              {item.label}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
