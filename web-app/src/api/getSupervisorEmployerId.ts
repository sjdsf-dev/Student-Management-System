import apiClient from "../lib/axios";
import { appConfig } from "../config/configs";

// src/api/getSupervisorEmployerId.ts
console.log("TEST");
// Type definitions
type EmployerIDName = {
  id: number;
  name: string;
};

type SupervisorIDName = {
  supervisor_id: number;
  first_name: string;
  last_name: string;
};
const configs = (window as any).configs || {};
// Use import.meta.env for Vite or process.env for Node.js
const API_KEY =
  appConfig.VITE_API_KEY ||
  (typeof process !== "undefined" ? process.env.API_KEY : undefined);

export function useSupervisorEmployerService() {
  const getAllEmployerIDsAndNames = async (): Promise<EmployerIDName[]> => {
    try {
      const response = await apiClient.get<EmployerIDName[]>('/get-employer-ids', {
        headers: {
          "api-key": API_KEY,
        },
      });
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as EmployerIDName[]) : [];
    } catch (error) {
      console.error("Error fetching employer IDs and names:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const getAllSupervisorIDsAndNames = async (): Promise<SupervisorIDName[]> => {
    try {
      const response = await apiClient.get<SupervisorIDName[]>('/get-supervisor-ids', {
        headers: {
          "api-key": API_KEY,
        },
      });
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as SupervisorIDName[]) : [];
    } catch (error) {
      console.error("Error fetching supervisor IDs and names:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  return { getAllEmployerIDsAndNames, getAllSupervisorIDsAndNames };
}
