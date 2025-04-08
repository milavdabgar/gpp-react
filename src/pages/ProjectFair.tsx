import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProjectFairAdmin from '../components/projectFair/admin/ProjectFairAdmin';
import ProjectRegistrationForm from '../components/projectFair/registration/ProjectRegistrationForm';
import JuryEvaluation from '../components/projectFair/jury/JuryEvaluation';
import ProjectFairStudent from '../components/projectFair/student/ProjectFairStudent';
import { useAuth } from '../context/AuthContext';
import { ProjectEvent } from '../types/project.types';
import { getActiveEvents } from '../services/projectApi';

const ProjectFair: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<ProjectEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        setLoading(true);
        console.log('Fetching active events...');
        const events = await getActiveEvents();
        console.log('Active events fetched:', events);
        if (events && events.length > 0) {
          console.log('Setting active event to:', events[0]);
          setActiveEvent(events[0]);
        } else {
          console.log('No active events found');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching active events:', err);
        setError('Failed to load event information');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvent();
  }, []);

  // Render appropriate component based on user role
  const renderComponent = () => {
    console.log('Rendering component. activeEvent:', activeEvent, 'user roles:', user?.roles);
    
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

    // Allow admins to access admin section even without active event
    if (user?.roles?.includes('admin')) {
      console.log('User is admin, rendering ProjectFairAdmin with event:', activeEvent || { _id: '', id: '', title: '', description: '', startDate: '', endDate: '', status: 'inactive' });
      return <ProjectFairAdmin event={activeEvent || { _id: '', id: '', title: '', description: '', startDate: '', endDate: '', status: 'inactive' }} />;
    }

    if (!activeEvent) {
      if (user?.roles?.includes('admin')) {
        return (
          <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  No Active Project Fair Event
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  As an admin, you can create a new project fair event.
                </p>
                <div className="mt-8">
                  <ProjectFairAdmin event={{ _id: '', id: '', title: '', description: '', startDate: '', endDate: '', status: 'draft' }} />
                </div>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                No Active Project Fair Event
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                There is currently no active project fair event. Please check back later or contact the administrator.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!user || !user.roles) {
      return <ProjectRegistrationForm event={activeEvent} />;
    }
    
    if (user.roles.includes('jury')) {
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
      <Route path="/admin/*" element={user?.roles?.includes('admin') ? <ProjectFairAdmin event={activeEvent || { _id: '', id: '', title: '', description: '', startDate: '', endDate: '', status: 'inactive' }} /> : <Navigate to="/" replace />} />
      <Route path="/jury/*" element={user?.roles?.includes('jury') && activeEvent ? <JuryEvaluation event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="/student/*" element={user?.roles?.includes('student') && activeEvent ? <ProjectFairStudent event={activeEvent} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ProjectFair;
