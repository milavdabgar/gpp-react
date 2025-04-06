import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectFair from './pages/ProjectFair';
import { Login } from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/admin/Users';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="project-fair" element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'jury']}>
                  <ProjectFair />
                </ProtectedRoute>
              } />
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route index element={<div>Admin Dashboard</div>} />
                    <Route path="users" element={<Users />} />
                  </Routes>
                </ProtectedRoute>
              } />
              <Route path="hod/*" element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <div>HOD Dashboard</div>
                </ProtectedRoute>
              } />
              <Route path="principal/*" element={
                <ProtectedRoute allowedRoles={['principal']}>
                  {/* Principal components will go here */}
                  <div>Principal Dashboard</div>
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
