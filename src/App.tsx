import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectFair from './pages/ProjectFair';
import { Login } from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/admin/Users';
import Roles from './pages/admin/Roles';
import Departments from './pages/admin/Departments';
import Faculty from './pages/admin/Faculty';
import Student from './pages/admin/Student';
import Results from './pages/admin/Results';
import FeedbackAnalysis from './pages/admin/FeedbackAnalysis';
import FeedbackReportPage from './pages/FeedbackReportPage';
import AdminDashboard from './pages/admin/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer position="top-right" />
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
              <Route path="project-fair/*" element={
                <ProtectedRoute allowedRoles={['student', 'faculty', 'admin', 'jury']}>
                  <ProjectFair />
                </ProtectedRoute>
              } />
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="roles" element={<Roles />} />
                    <Route path="feedback-analysis" element={<FeedbackAnalysis />} />
                    <Route path="feedback-analysis/report/:id" element={<FeedbackReportPage />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="faculties" element={<Faculty />} />
                    <Route path="students" element={<Student />} />
                    <Route path="results" element={<Results />} />
                    <Route path="feedback-analysis" element={<FeedbackAnalysis />} />
                    <Route path="reports" element={<div>Reports Coming Soon</div>} />
                    <Route path="settings" element={<div>Settings Coming Soon</div>} />
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