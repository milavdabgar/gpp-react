export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
  errors?: any[];
}

export interface EducationBackground {
  degree: string;
  institution: string;
  board: string;
  percentage: number;
  yearOfPassing: number;
}

export interface StudentGuardian {
  name: string;
  relation: string;
  contact: string;
  occupation: string;
}

export interface StudentContact {
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Student {
  _id: string;
  userId: string;
  departmentId: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  admissionDate: string;
  status: string;
  guardian: StudentGuardian;
  contact: StudentContact;
  educationBackground?: EducationBackground[];
  user?: {
    _id: string;
    name: string;
    email: string;
    roles?: string[];
  };
  department?: {
    _id: string;
    name: string;
  };
}

export type SortField = 'enrollmentNo' | 'batch' | 'department' | 'admissionDate';
export type SortOrder = 'asc' | 'desc';

export interface CreateStudentDto {
  userId?: string;
  departmentId: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  admissionDate: string;
  status: string;
  guardian: StudentGuardian;
  contact: StudentContact;
  educationBackground?: EducationBackground[];
}
