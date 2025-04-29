import axios from 'axios';
import { User } from '../types/auth';
import type { Student, CreateStudentDto } from '../types/api';

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data: T;
  token?: string;
}

export interface GTUImportResponse {
  results: Student[];
  count: number;
  errors?: { row: number; error: string }[];
  warnings?: { row: number; warning: string }[];
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
  exportFacultyCsv: async () => {
    const response = await api.get('/faculty/export-csv', {
      responseType: 'blob'
    });
    return response;
  },

  uploadFacultyCsv: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{ faculty: any[] }>>('/faculty/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllFaculty: async (): Promise<ApiResponse<{ faculty: any[] }>> => {
    const response = await api.get<ApiResponse<{ faculty: any[] }>>('/faculty');
    return response.data;
  },

  getFaculty: async (id: string): Promise<ApiResponse<{ faculty: any }>> => {
    const response = await api.get<ApiResponse<{ faculty: any }>>(`/faculty/${id}`);
    return response.data;
  },

  createFaculty: async (facultyData: {
    name: string;
    email: string;
    employeeId: string;
    designation: string;
    departmentId: string;
    joiningDate: string;
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
  }) => {
    const response = await api.post<ApiResponse<{ faculty: any; password: string }>>('/faculty', facultyData);
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

export const studentApi = {
  exportStudentsCsv: async () => {
    const response = await api.get('/students/export-csv', {
      responseType: 'blob',
    });
    return response;
  },

  uploadStudentsCsv: async (formData: FormData) => {
    const response = await api.post<GTUImportResponse>('/students/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllStudents: async (page = 1, limit = 100) => {
    console.log('Fetching students with pagination...');
    const response = await api.get<ApiResponse<{ 
      students: Student[],
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    }>>('/students', {
      params: { page, limit }
    });
    console.log('Student response:', response.data);
    return response.data;
  },

  getStudent: async (id: string) => {
    const response = await api.get<ApiResponse<{ student: Student }>>(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData: CreateStudentDto & { name?: string; email?: string; password?: string }) => {
    const response = await api.post<ApiResponse<{ student: Student }>>('/students', studentData);
    return response.data;
  },

  updateStudent: async (id: string, studentData: Partial<CreateStudentDto>) => {
    const response = await api.patch<ApiResponse<{ student: Student }>>(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await api.delete<ApiResponse<{ student: Student }>>(`/students/${id}`);
    return response.data;
  },

  getStudentsByDepartment: async (departmentId: string) => {
    const response = await api.get<ApiResponse<{ students: Student[] }>>(`/students/department/${departmentId}`);
    return response.data;
  },
};

export const resultApi = {
  // Get all results with optional filtering
  getAllResults: async (params: {
    page?: number;
    limit?: number;
    branchName?: string;
    semester?: number;
    academicYear?: string;
    examid?: number;
    uploadBatch?: string;
  } = {}) => {
    const response = await api.get('/results', { params });
    return response.data;
  },

  // Get a single result by ID
  getResult: async (id: string) => {
    const response = await api.get(`/results/${id}`);
    return response.data;
  },

  // Get all results for a specific student
  getStudentResults: async (studentId: string) => {
    const response = await api.get(`/results/student/${studentId}`);
    return response.data;
  },

  // Get recent upload batches
  getUploadBatches: async () => {
    const response = await api.get('/results/batches');
    return response.data;
  },

  // Import results from a CSV file
  importResults: async (formData: FormData) => {
    const response = await api.post('/results/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export results to CSV with optional filtering
  exportResults: async (params: {
    branchName?: string;
    semester?: number;
    academicYear?: string;
    examid?: number;
    uploadBatch?: string;
  } = {}) => {
    const response = await api.get('/results/export', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  // Delete a result by ID
  deleteResult: async (id: string) => {
    const response = await api.delete(`/results/${id}`);
    return response.data;
  },

  // Delete all results in a batch
  deleteResultsByBatch: async (batchId: string) => {
    const response = await api.delete(`/results/batch/${batchId}`);
    return response.data;
  },

  // Get branch-wise analysis
  getBranchAnalysis: async (params: {
    academicYear?: string;
    examid?: number;
  } = {}) => {
    const response = await api.get('/results/analysis/branch', { params });
    return response.data;
  }
};

export default api;