import apiClient from "../lib/axios";
import { appConfig } from "../config/configs";

const API_KEY =
  appConfig.VITE_API_KEY ||
  (typeof process !== "undefined" ? process.env.API_KEY : undefined);

export async function getOTP(studentId: string | number) {
  try {
    const response = await apiClient.post('/generate-otp', {}, {
      headers: {
        accept: "application/json",
        "student-id": String(studentId),
        "api-key": API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error generating OTP:", error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}
