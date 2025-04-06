export type Role = 'student' | 'faculty' | 'hod' | 'principal' | 'admin' | 'jury';

export interface User {
  id: string;
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
