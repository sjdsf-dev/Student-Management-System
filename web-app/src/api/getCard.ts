import axios from "axios";
import { API_URL } from "../config/configs";
import { Card } from "../types/card";

export function useCardService() {
  const getCards = async (): Promise<Card[]> => {
    try {
      const response = await axios.get<Card[]>(`${API_URL}/dashboard`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Ensure cookies are sent with the request
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching cards:", error);
      throw error;
    }
  };

  return { getCards };
}
