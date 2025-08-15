import apiClient from "../lib/axios";
import { appConfig } from "@/config/configs";

// Employer type definitions
export interface EmployerInput {
  name: string;
  contact_number: string;
  address_line1: string;
  address_line2?: string;
  address_line3: string;
  addr_long: number;
  addr_lat: number;
}

export interface Employer {
  id: number;
  name: string;
  contact_number: string;
  address_line1: string;
  address_line2?: string;
  address_line3: string;
  addr_long: number;
  addr_lat: number;
}

const API_KEY =
  appConfig.VITE_API_KEY ||
  (typeof process !== "undefined" ? process.env.API_KEY : undefined);

export function useEmployerService() {
  const getEmployers = async (): Promise<Employer[]> => {
    try {
      const response = await apiClient.get<Employer[]>('/get-employer-ids', {
        headers: {
          "api-key": API_KEY,
        },
      });
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as Employer[]) : [];
    } catch (error) {
      console.error("Error fetching employers:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const getEmployerById = async (id: number): Promise<Employer> => {
    try {
      const response = await apiClient.get<Employer>('/get-employer', {
        headers: {
          "api-key": API_KEY,
          "employer-id": id,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employer with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const createEmployer = async (employer: EmployerInput): Promise<Employer> => {
    try {
      const response = await apiClient.post<Employer>('/create-employer', employer, {
        headers: {
          "api-key": API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employer:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const updateEmployer = async (
    id: number,
    employer: Partial<EmployerInput>
  ): Promise<Employer> => {
    try {
      const response = await apiClient.put<Employer>('/update-employer', employer, {
        headers: {
          "api-key": API_KEY,
          "employer-id": id,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating employer with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const deleteEmployer = async (id: number): Promise<void> => {
    try {
      await apiClient.delete('/delete-employer', {
        headers: {
          "api-key": API_KEY,
          "employer-id": id,
        },
      });
    } catch (error) {
      console.error(`Error deleting employer with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  return {
    getEmployers,
    getEmployerById,
    createEmployer,
    updateEmployer,
    deleteEmployer,
  };
}
