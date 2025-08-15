export const API_URL = "/choreo-apis/student-management-system/backend/v1";
export const SUMMARIZER_API_URL =
  "/choreo-apis/student-management-system/summarizer/v1";

declare global {
  interface Window {
    config: {
      VITE_API_KEY: string;
      VITE_AZURE_CLIENT_ID: string;
      VITE_AZURE_TENANT_ID: string;
      apiUrl: string;
      VITE_GOOGLE_SHEET_API_KEY: string;
    };
  }
}

export const appConfig = window.config;
