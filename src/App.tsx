import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectFair from './pages/ProjectFair';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="project-fair/*" element={<ProjectFair />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
