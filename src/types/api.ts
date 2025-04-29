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

// Add this to your existing types/api.ts file
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
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  admissionYear: number;
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
  convoYear?: number;
  isComplete: boolean;
  termClose: boolean;
  isCancel: boolean;
  isPassAll: boolean;
}

export interface Subject {
  code: string;
  name: string;
  credits: number;
  grade: string;
  isBacklog: boolean;
}

export interface Result {
  _id: string;
  st_id: string;
  extype: string;
  examid: number;
  exam: string;
  declarationDate: string;
  academicYear: string;
  semester: number;
  name: string;
  branchName: string;
  subjects: Subject[];
  totalCredits: number;
  earnedCredits: number;
  spi: number;
  cpi: number;
  cgpa: number;
  result: string;
  trials: number;
  remark: string;
  uploadBatch: string;
  createdAt: string;
}

export type SortField = 'enrollmentNo' | 'batch' | 'department' | 'admissionYear';
export type SortOrder = 'asc' | 'desc';

export interface CreateStudentDto {
  userId?: string;
  departmentId: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  admissionYear: number;
  status: string;
  guardian: StudentGuardian;
  contact: StudentContact;
  educationBackground?: EducationBackground[];
}