import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState, LoginCredentials } from '../types/auth';
import { authApi, userApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => Promise<boolean>;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user profile
      userApi.getProfile()
        .then(response => {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        })
        .catch(() => {
          // If token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState(prev => ({ ...prev, loading: false }));
        });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authApi.login(credentials);
      const { token, data: { user } } = response;

      // Store token and user data
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Login failed'
      }));
      return false;
    }
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const switchRole = async (role: Role): Promise<boolean> => {
    try {
      if (!state.user || !state.user.roles.includes(role)) {
        throw new Error('Invalid role');
      }

      setState(prev => ({ ...prev, loading: true }));
      const response = await authApi.switchRole(role);
      const { token, data: { user } } = response;

      // Update token and user data
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to switch role'
      }));
      return false;
    }
  };

  const hasRole = (role: Role): boolean => {
    return state.user?.selectedRole === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.includes(state.user?.selectedRole as Role);
  };

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        login,
        logout,
        switchRole,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
