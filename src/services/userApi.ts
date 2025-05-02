import api from './api';
import { Role } from '../types/auth';

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
  roles: Role[];
  selectedRole: Role;
}

interface UserResponse {
  status: string;
  data: {
    users: User[];
    pagination: PaginationData;
  };
}

export const userApi = {
  getAllUsers: async (page: number, limit: number) => {
    const response = await api.get<UserResponse>(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId: string, userData: any) => {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  importUsers: async (formData: FormData) => {
    const response = await api.post('/admin/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportUsers: async () => {
    const response = await api.get<Blob>('/admin/users/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default userApi;
