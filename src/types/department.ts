import { User } from './auth';

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  hodId?: string | { _id: string; name: string; };
  establishedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStats {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  userCount: number;
  hasHOD: boolean;
}
