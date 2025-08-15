// TODO
// No need to send API KEY in headers for APIs
import apiClient from "../lib/axios";
import { appConfig } from "../config/configs";

export interface Attendance {
  check_in_date_time: string;
  check_out_date_time: string | null;
}

export interface Mood {
  emotion: string;
  recorded_at: string;
}

export interface EmployeeSummary {
  attendances: Attendance[];
  remarks: string;
  moods: Mood[];
}
const configs = (window as any).configs || {};
// Use import.meta.env for Vite or process.env for Node.js
const API_KEY =
  appConfig.VITE_API_KEY ||
  (typeof process !== "undefined" ? process.env.API_KEY : undefined);

export async function getEmployeeSummary(
  studentId: number
): Promise<EmployeeSummary> {
  try {
    const response = await apiClient.get<EmployeeSummary>('/employee-summary', {
      headers: {
        "api-key": API_KEY,
        "student-id": studentId.toString(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching employee summary:", error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}
