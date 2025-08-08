// src/components/layout/SidebarItem.tsx
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  compact: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, compact }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 rounded-lg font-medium text-sm transition-all duration-200
       ${
         isActive
           ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
           : "text-gray-600 hover:bg-gray-100"
       }
       ${compact ? "w-12 h-12 justify-center" : "py-4 justify-start"}
       mx-1`
    }
    aria-label={label}
  >
    <Icon className={`w-6 h-6 ${!compact ? "ml-3" : ""}`} />
    {!compact && <span className="ml-2">{label}</span>}
  </NavLink>
);

export default SidebarItem;
