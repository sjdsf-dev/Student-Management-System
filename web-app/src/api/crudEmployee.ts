import apiClient from "../lib/axios";
import { appConfig } from "../config/configs";
import { Student } from "@/types/student";
// Student type definition

const API_KEY =
  appConfig.VITE_API_KEY ||
  (typeof process !== "undefined" ? process.env.API_KEY : undefined);

export function useStudentService() {
  const getStudents = async (): Promise<Student[]> => {
    try {
      const response = await apiClient.get<Student[]>('/student', {
        headers: {
          "api-key": API_KEY,
        },
      });
      const data = response.data as unknown;
      return Array.isArray(data) ? (data as Student[]) : [];
    } catch (error) {
      console.error("Error fetching students:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const getStudentById = async (id: number): Promise<Student> => {
    try {
      const response = await apiClient.get<Student>('/get-student', {
        headers: {
          "api-key": API_KEY,
          "student-id": id,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching student with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const createStudent = async (
    student: Omit<Student, "id">
  ): Promise<Student> => {
    try {
      const response = await apiClient.post<Student>('/create-employee', student, {
        headers: {
          "api-key": API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating student:", error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const updateStudent = async (
    id: number,
    student: Partial<Student>
  ): Promise<Student> => {
    try {
      const response = await apiClient.put<Student>('/update-employee', student, {
        headers: {
          "api-key": API_KEY,
          "student-id": id,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating student with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  const deleteStudent = async (id: number): Promise<void> => {
    try {
      await apiClient.delete('/delete-employee', {
        headers: {
          "api-key": API_KEY,
          "student-id": id,
        },
      });
    } catch (error) {
      console.error(`Error deleting student with id ${id}:`, error);
      // The axios interceptor will handle 401/403 errors globally
      throw error;
    }
  };

  return {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
