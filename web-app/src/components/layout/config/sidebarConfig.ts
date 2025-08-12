// src/components/config/sidebarConfig.ts
import {
  LayoutDashboard,
  MessageSquareText,
  Contact,
  Factory,
  BriefcaseBusiness,
  Phone,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/manager-feedback",
    icon: MessageSquareText,
    label: "Manager Feedbacks",
  },
  { to: "/student-management", icon: Contact, label: "Student Management" },
  { to: "/employer-management", icon: Factory, label: "Employer Management" },
  {
    to: "/supervisor-management",
    icon: BriefcaseBusiness,
    label: "Supervisor Management",
  },
  {
    to: "/emergency-contact",
    icon: Phone,
    label: "Emergency Contact",
  },
];
