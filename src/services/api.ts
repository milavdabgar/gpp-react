import axios from 'axios';
import { User } from '../types/auth';

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: ApiError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: ApiError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string; selectedRole: string }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    roles?: string[];
    selectedRole?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/signup', userData);
    return response.data;
  },

  switchRole: async (role: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/switch-role', { role });
    return response.data;
  },
};

export const userApi = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data;
  },

  updateProfile: async (userData: {
    name?: string;
    email?: string;
    department?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.patch<ApiResponse<{ user: User }>>('/users/updateMe', userData);
    return response.data;
  },
};

export const facultyApi = {
  getAllFaculty: async (): Promise<ApiResponse<{ faculty: any[] }>> => {
    const response = await api.get<ApiResponse<{ faculty: any[] }>>('/faculty');
    return response.data;
  },

  getFaculty: async (id: string): Promise<ApiResponse<{ faculty: any }>> => {
    const response = await api.get<ApiResponse<{ faculty: any }>>(`/faculty/${id}`);
    return response.data;
  },

  createFaculty: async (facultyData: {
    userId: string;
    employeeId: string;
    designation: string;
    departmentId: string;
    joiningDate: string;
  }): Promise<ApiResponse<{ faculty: any }>> => {
    const response = await api.post<ApiResponse<{ faculty: any }>>('/faculty', facultyData);
    return response.data;
  },

  updateFaculty: async (id: string, facultyData: {
    employeeId?: string;
    designation?: string;
    departmentId?: string;
    joiningDate?: string;
    specializations?: string[];
    qualifications?: {
      degree: string;
      field: string;
      institution: string;
      year: number;
    }[];
    status?: string;
    experience?: {
      years: number;
      details: string;
    };
  }): Promise<ApiResponse<{ faculty: any }>> => {
    const response = await api.patch<ApiResponse<{ faculty: any }>>(`/faculty/${id}`, facultyData);
    return response.data;
  },

  deleteFaculty: async (id: string): Promise<ApiResponse<{ faculty: any }>> => {
    const response = await api.delete<ApiResponse<{ faculty: any }>>(`/faculty/${id}`);
    return response.data;
  },

  getFacultyByDepartment: async (departmentId: string): Promise<ApiResponse<{ faculty: any[] }>> => {
    const response = await api.get<ApiResponse<{ faculty: any[] }>>(`/faculty/department/${departmentId}`);
    return response.data;
  }
};

export default api;
