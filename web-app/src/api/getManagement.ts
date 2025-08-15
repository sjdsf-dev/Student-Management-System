import apiClient from "../lib/axios";
import { appConfig } from "../config/configs";

export interface StudentEmployerSupervisor {
    student_id: number;
    student_first_name: string;
    student_last_name: string;
    employer_name: string | null;
    employer_contact_number: string | null;
    supervisor_first_name: string | null;
    supervisor_last_name: string | null;
    supervisor_contact_number: string | null;
}

export async function getManagementTable(): Promise<StudentEmployerSupervisor[]> {
    try {
        const response = await apiClient.get<StudentEmployerSupervisor[]>('/management', {
            headers: {
                "accept": "application/json",
                "api-key": appConfig.VITE_API_KEY,
            }
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error fetching management table:", error);
        // The axios interceptor will handle 401/403 errors globally
        throw error;
    }
}