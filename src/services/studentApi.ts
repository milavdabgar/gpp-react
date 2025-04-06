import api from './api';
import { ApiResponse } from '../types/api';

export const studentApi = {
  getAllStudents: async () => {
    const response = await api.get<ApiResponse<{ students: any[] }>>('/students');
    return response.data;
  },

  createStudent: async (studentData: any) => {
    const response = await api.post<ApiResponse<{ student: any; password: string }>>('/students', studentData);
    return response.data;
  },

  updateStudent: async (id: string, studentData: any) => {
    const response = await api.patch<ApiResponse<{ student: any }>>(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/students/${id}`);
    return response.data;
  },

  uploadStudentsCsv: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ students: any[] }>>('/students/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
