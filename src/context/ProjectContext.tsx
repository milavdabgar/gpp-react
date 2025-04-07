import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as projectService from '../services/project.service';

const ProjectContext = createContext(null);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Active event state
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Project-related state
  const [myProjects, setMyProjects] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Location-related state
  const [locations, setLocations] = useState([]);
  const [locationSections, setLocationSections] = useState([]);
  
  // Jury-related state
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [completedEvaluations, setCompletedEvaluations] = useState([]);
  
  // Admin dashboard state
  const [projectStats, setProjectStats] = useState(null);
  
  // Fetch active event
  const fetchActiveEvent = async () => {
    setLoading(true);
    try {
      const response = await projectService.getActiveEvents();
      const events = response.data.events;
      
      if (events && events.length > 0) {
        setActiveEvent(events[0]);
      }
    } catch (err) {
      setError('Failed to fetch active event: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data.data.departments);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };
  
  // Fetch my projects (for students/faculty)
  const fetchMyProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await projectService.getMyProjects();
      setMyProjects(response.data.projects);
    } catch (err) {
      console.error('Failed to fetch my projects:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch my teams (for students)
  const fetchMyTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await projectService.getMyTeams();
      setMyTeams(response.data.teams);
    } catch (err) {
      console.error('Failed to fetch my teams:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch jury assignments (for jury members)
  const fetchJuryAssignments = async (evaluationType = 'department') => {
    if (!user || !user.roles.includes('jury')) return;
    
    setLoading(true);
    try {
      const response = await projectService.getProjectsForJury(evaluationType);
      setPendingEvaluations(response.data.pendingProjects);
      setCompletedEvaluations(response.data.evaluatedProjects);
    } catch (err) {
      console.error('Failed to fetch jury assignments:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all projects (for admin)
  const fetchAllProjects = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await projectService.getAllProjects(filters);
      setProjectList(response.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch location assignments for an event
  const fetchLocations = async (eventId, section = null) => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      let response;
      if (section) {
        response = await projectService.getLocationsBySection(section);
        setLocations(response.data.locations);
      } else {
        response = await projectService.getLocationsByEvent(eventId);
        setLocationSections(response.data.sections);
        setLocations(response.data.sections.flatMap(section => section.locations));
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch project statistics for dashboard
  const fetchProjectStats = async (eventId) => {
    setLoading(true);
    try {
      const response = await projectService.getProjectStatistics(eventId);
      setProjectStats(response.data);
    } catch (err) {
      console.error('Failed to fetch project statistics:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Evaluate a project
  const evaluateProject = async (projectId, evaluationData, evaluationType = 'department') => {
    if (!user || !user.roles.includes('jury')) return;
    
    setLoading(true);
    try {
      if (evaluationType === 'department') {
        await projectService.evaluateProjectByDepartment(projectId, evaluationData);
      } else {
        await projectService.evaluateProjectByCentral(projectId, evaluationData);
      }
      
      // Refresh jury assignments
      await fetchJuryAssignments(evaluationType);
      return true;
    } catch (err) {
      setError('Failed to submit evaluation: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Assign a location to a project
  const assignLocation = async (locationId, projectId) => {
    setLoading(true);
    try {
      await projectService.assignProjectToLocation(locationId, projectId);
      // Refresh locations
      if (activeEvent) {
        await fetchLocations(activeEvent._id);
      }
      return true;
    } catch (err) {
      setError('Failed to assign location: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Unassign a location
  const unassignLocation = async (locationId) => {
    setLoading(true);
    try {
      await projectService.unassignProjectFromLocation(locationId);
      // Refresh locations
      if (activeEvent) {
        await fetchLocations(activeEvent._id);
      }
      return true;
    } catch (err) {
      setError('Failed to unassign location: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  // Initialize context data
  useEffect(() => {
    fetchActiveEvent();
    fetchDepartments();
  }, []);
  
  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      // For students and faculty
      fetchMyProjects();
      fetchMyTeams();
      
      // For jury members
      if (user.roles.includes('jury')) {
        fetchJuryAssignments();
      }
      
      // For admins, load the full project list
      if (user.roles.includes('admin')) {
        fetchAllProjects();
        if (activeEvent) {
          fetchLocations(activeEvent._id);
          fetchProjectStats(activeEvent._id);
        }
      }
    }
  }, [user, activeEvent]);
  
  const contextValue = {
    // State
    activeEvent,
    loading,
    error,
    myProjects,
    myTeams,
    projectList,
    departments,
    locations,
    locationSections,
    pendingEvaluations,
    completedEvaluations,
    projectStats,
    
    // Actions
    fetchActiveEvent,
    fetchMyProjects,
    fetchMyTeams,
    fetchAllProjects,
    fetchLocations,
    fetchJuryAssignments,
    fetchProjectStats,
    evaluateProject,
    assignLocation,
    unassignLocation,
    clearError
  };
  
  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;