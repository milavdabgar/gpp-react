export type Role = 'student' | 'faculty' | 'hod' | 'principal' | 'admin' | 'jury';

export interface RoleWithPermissions {
  id: string;
  name: Role;
  description: string;
  permissions: ('create' | 'read' | 'update' | 'delete')[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  department?: string;
  roles: Role[];
  selectedRole?: Role;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  selectedRole: Role;
}
