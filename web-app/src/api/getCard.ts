import apiClient from "../lib/axios";
import { Card } from "../types/card";

export function useCardService() {
  const getCards = async (): Promise<Card[]> => {
    try {
      const response = await apiClient.get<Card[]>('/dashboard');
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as Card[]) : [];
    } catch (error: any) {
      console.error("Error fetching cards:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  return { getCards };
}
