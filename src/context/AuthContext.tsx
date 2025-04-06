import React, { createContext, useContext, useState } from 'react';

interface User {
  name: string;
  department: string;
}

interface AuthContextType {
  user: User | null;
  role: string;
  login: (username: string, password: string, selectedRole: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('student'); // Default role
  
  const login = (username: string, password: string, selectedRole: string): boolean => {
    // In a real app, you'd make an API call here
    setUser({ name: 'Raj Patel', department: 'Computer Engineering' });
    setRole(selectedRole);
    localStorage.setItem('userRole', selectedRole);
    return true;
  };
  
  const logout = () => {
    setUser(null);
    setRole('student');
    localStorage.removeItem('userRole');
  };
  
  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
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
