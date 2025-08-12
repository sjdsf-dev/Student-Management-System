import { API_URL } from "../config/configs";

export async function fetchEmergencyContact(): Promise<string> {
  const response = await fetch(`${API_URL}/get-emergency-contact`);
  if (!response.ok) throw new Error("Failed to fetch emergency contact");
  const data = await response.json();
  return data.phone_number;
}

export async function updateEmergencyContact(newNumber: string): Promise<void> {
  const response = await fetch(`${API_URL}/update-emergency-contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: newNumber }),
  });
  if (!response.ok) throw new Error("Failed to update emergency contact");
}
