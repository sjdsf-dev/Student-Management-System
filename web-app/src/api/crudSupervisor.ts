import apiClient from "../lib/axios";
import { Supervisor } from "@/types/supervisor";

// Get all supervisors
export async function getAllSupervisors(): Promise<Supervisor[]> {
  console.log("Calling GET /get-supervisors");
  try {
    const res = await apiClient.get('/get-supervisors');
    console.log("Response from /get-supervisors:", res.data);
    const data = res.data as unknown;
    return Array.isArray(data) ? (data as Supervisor[]) : [];
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}

// Get supervisor by ID
export async function getSupervisorById(id: number): Promise<Supervisor> {
  console.log("Calling GET /get-supervisor with id:", id);
  try {
    const res = await apiClient.get('/get-supervisor', {
      headers: { "supervisor-id": String(id) },
    });
    console.log("Response from /get-supervisor:", res.data);
    return res.data;
  } catch (error) {
    console.error(`Error fetching supervisor with id ${id}:`, error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}

// Create supervisor
export async function createSupervisor(
  data: Omit<Supervisor, "supervisor_id">
): Promise<Supervisor> {
  console.log("Calling POST /create-supervisor with data:", data);
  try {
    const res = await apiClient.post('/create-supervisor', data);
    console.log("Response from /create-supervisor:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error creating supervisor:", error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}

// Update supervisor
export async function updateSupervisor(
  id: number,
  data: Omit<Supervisor, "supervisor_id">
): Promise<Supervisor> {
  console.log("Calling PUT /update-supervisor with id:", id, "and data:", data);
  try {
    const res = await apiClient.put('/update-supervisor', data, {
      headers: { "supervisor-id": String(id) },
    });
    console.log("Response from /update-supervisor:", res.data);
    return res.data;
  } catch (error) {
    console.error(`Error updating supervisor with id ${id}:`, error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}

// Delete supervisor
export async function deleteSupervisor(id: number): Promise<void> {
  console.log("Calling DELETE /delete-supervisor with id:", id);
  try {
    const res = await apiClient.delete('/delete-supervisor', {
      headers: { "supervisor-id": String(id) },
    });
    console.log("Response from /delete-supervisor:", res.status);
  } catch (error) {
    console.error(`Error deleting supervisor with id ${id}:`, error);
    // The axios interceptor will handle 401/403 errors globally
    throw error;
  }
}

// Hook for Supervisor CRUD
export function useSupervisorService() {
  return {
    getAllSupervisors,
    getSupervisorById,
    createSupervisor,
    updateSupervisor,
    deleteSupervisor,
  };
}
