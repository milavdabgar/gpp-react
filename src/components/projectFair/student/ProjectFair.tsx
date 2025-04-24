import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getActiveEvents } from '../../../services/projectApi';
import ProjectFairAdmin from '../admin/ProjectFairAdmin';
import ProjectRegistrationForm from '../registration/ProjectRegistrationForm';
import JuryEvaluation from '../jury/JuryEvaluation';
import ProjectFairStudent from './ProjectFairStudent';
import { useAuth } from '../../../context/AuthContext';
import { ProjectEvent } from '../../../types/project.types';

interface ProjectFairAdminProps {
  event: ProjectEvent;
}

interface ProjectRegistrationFormProps {
  event: ProjectEvent;
}

interface JuryEvaluationProps {
  event: ProjectEvent;
}

interface ProjectFairStudentProps {
  event: ProjectEvent;
}

const ProjectFair: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<ProjectEvent | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        setLoading(true);
        const events = await getActiveEvents();
        if (events && events.length > 0) {
          setActiveEvent(events[0]);  // Use the first active event
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event information');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvent();
  }, []);

  // Render appropriate component based on user role
  const renderComponent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event information...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!activeEvent) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-gray-600">
            <p>No active project fair event found.</p>
            <p className="mt-2">Please check back later or contact the administrator.</p>
          </div>
        </div>
      );
    }

    if (!user || !user.roles) {
      return <ProjectRegistrationForm event={activeEvent} />;
    }
    
    if (user.roles.includes('admin')) {
      return <ProjectFairAdmin event={activeEvent} />;
    } else if (user.roles.includes('jury')) {
      return <JuryEvaluation event={activeEvent} />;
    } else if (user.roles.includes('student')) {
      return <ProjectFairStudent event={activeEvent} />;
    } else {
      return <ProjectRegistrationForm event={activeEvent} />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={renderComponent()} />
      <Route path="/register" element={activeEvent ? <ProjectRegistrationForm event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="/admin/*" element={user?.roles?.includes('admin') && activeEvent ? <ProjectFairAdmin event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="/jury/*" element={user?.roles?.includes('jury') && activeEvent ? <JuryEvaluation event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="/student/*" element={user?.roles?.includes('student') && activeEvent ? <ProjectFairStudent event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ProjectFair;