import React, { useState, useEffect } from 'react';
import ProjectList from './ProjectList';
import ProjectView from './ProjectView';
import { ChevronLeft, Home, User, Award, Calendar, Info, Clock, Check, Filter } from 'lucide-react';
import { getMyProjects } from '../../../services/projectApi';
import { useAuth } from '../../../context/AuthContext';
import { Project, ProjectEvent } from '../../../types/project.types';
import { toast } from 'react-toastify';

interface ProjectFairStudentProps {
  event: ProjectEvent;
}

const ProjectFairStudent: React.FC<ProjectFairStudentProps> = ({ event }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'my-projects'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const projectsData = await getMyProjects();
        setMyProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Error fetching my projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (viewMode === 'my-projects') {
      fetchMyProjects();
    }
  }, [user, viewMode]);

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProjectId(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4">
      {/* Event Information Banner */}
      {event && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-800">{event.name}</h2>
              <div className="flex items-center text-blue-600 mt-1">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(event.eventDate)}</span>
              </div>
            </div>
            {event.registrationEndDate && new Date() < new Date(event.registrationEndDate) && (
              <div className="mt-4 md:mt-0">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  onClick={() => window.location.href = '/project-fair/register'}
                >
                  Register Your Project
                </button>
              </div>
            )}
          </div>
          {event.description && (
            <div className="mt-3 text-sm text-blue-700">
              <Info size={16} className="inline mr-1" />
              {event.description}
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 flex items-center ${
              viewMode === 'list'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('list')}
          >
            <Home size={16} className="mr-1" />
            All Projects
          </button>
          <button
            className={`py-2 px-4 flex items-center ${
              viewMode === 'my-projects'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setViewMode('my-projects')}
          >
            <User size={16} className="mr-1" />
            My Projects
          </button>
          {event?.publishResults && (
            <button
              className={`py-2 px-4 flex items-center text-yellow-600 hover:text-yellow-700`}
            >
              <Award size={16} className="mr-1" />
              View Winners
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <ProjectList onViewProject={handleViewProject} event={event} />
      ) : viewMode === 'my-projects' ? (
        <div>
          <h2 className="text-xl font-bold mb-4">My Projects</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your projects...</p>
              </div>
            </div>
          ) : myProjects.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-gray-400 mb-3">
                <User size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't registered any projects for this event yet.
              </p>
              {event?.registrationEndDate && new Date() < new Date(event.registrationEndDate) && (
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => window.location.href = '/project-fair/register'}
                >
                  Register a Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {myProjects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                      <div className="text-sm text-gray-500">{project.category}</div>
                    </div>
                    <div className="text-sm text-gray-500">{project._id}</div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{project.abstract}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    )}
                    
                    {project.locationId && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Location: {project.locationId.locationId || 'Not Assigned'}
                      </span>
                    )}
                    
                    {project.deptEvaluation?.completed && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Dept Score: {project.deptEvaluation.score}%
                      </span>
                    )}
                    
                    {project.centralEvaluation?.completed && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Central Score: {project.centralEvaluation.score}%
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleViewProject(project._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={handleBackToList}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Projects
          </button>
          <ProjectView projectId={selectedProjectId} event={event} />
        </div>
      )}
    </div>
  );
};

export default ProjectFairStudent;