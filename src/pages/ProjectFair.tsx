import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProjectFairAdmin from '../components/projectFair/admin/ProjectFairAdmin';
import ProjectRegistrationForm from '../components/projectFair/registration/ProjectRegistrationForm';
import JuryEvaluation from '../components/projectFair/jury/JuryEvaluation';
import ProjectFairStudent from '../components/projectFair/student/ProjectFairStudent';
import { useAuth } from '../context/AuthContext';

const ProjectFair: React.FC = () => {
  const { user } = useAuth();

  // Render appropriate component based on user role
  const renderComponent = () => {
    if (!user || !user.roles) return <ProjectRegistrationForm />;
    
    if (user.roles.includes('admin')) {
      return <ProjectFairAdmin />;
    } else if (user.roles.includes('jury')) {
      return <JuryEvaluation />;
    } else if (user.roles.includes('student')) {
      return <ProjectFairStudent />;
    } else {
      return <ProjectRegistrationForm />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={renderComponent()} />
    </Routes>
  );
};

export default ProjectFair;
