import axios from 'axios';

const API_URL = '/api/projects';

// Project Services
export const getAllProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
};

export const getProject = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getProjectWithDetails = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/details`);
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await axios.patch(`${API_URL}/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getMyProjects = async () => {
  const response = await axios.get(`${API_URL}/my-projects`);
  return response.data;
};

export const evaluateProjectByDepartment = async (id, evaluationData) => {
  const response = await axios.post(`${API_URL}/${id}/department-evaluation`, evaluationData);
  return response.data;
};

export const evaluateProjectByCentral = async (id, evaluationData) => {
  const response = await axios.post(`${API_URL}/${id}/central-evaluation`, evaluationData);
  return response.data;
};

export const getProjectsForJury = async (evaluationType = 'department') => {
  const response = await axios.get(`${API_URL}/jury-assignments?evaluationType=${evaluationType}`);
  return response.data;
};

export const getProjectsByDepartment = async (departmentId) => {
  const response = await axios.get(`${API_URL}/department/${departmentId}`);
  return response.data;
};

export const getProjectsByEvent = async (eventId) => {
  const response = await axios.get(`${API_URL}/event/${eventId}`);
  return response.data;
};

export const getProjectsByTeam = async (teamId) => {
  const response = await axios.get(`${API_URL}/team/${teamId}`);
  return response.data;
};

export const getProjectStatistics = async (eventId) => {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await axios.get(`${API_URL}/statistics${params}`);
  return response.data;
};

export const getProjectCountsByCategory = async (eventId) => {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await axios.get(`${API_URL}/categories${params}`);
  return response.data;
};

export const getEventWinners = async (eventId) => {
  const response = await axios.get(`${API_URL}/event/${eventId}/winners`);
  return response.data;
};

export const generateProjectCertificates = async (eventId, type = 'participation') => {
  const response = await axios.get(`${API_URL}/event/${eventId}/certificates?type=${type}`);
  return response.data;
};

export const sendCertificateEmails = async (emailData) => {
  const response = await axios.post(`${API_URL}/certificates/send`, emailData);
  return response.data;
};

export const exportProjectsToCsv = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  window.location.href = `${API_URL}/export?${params.toString()}`;
};

export const importProjectsFromCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Team Services
export const getAllTeams = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  const response = await axios.get(`${API_URL}/teams?${params.toString()}`);
  return response.data;
};

export const getTeam = async (id) => {
  const response = await axios.get(`${API_URL}/teams/${id}`);
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await axios.post(`${API_URL}/teams`, teamData);
  return response.data;
};

export const updateTeam = async (id, teamData) => {
  const response = await axios.patch(`${API_URL}/teams/${id}`, teamData);
  return response.data;
};

export const deleteTeam = async (id) => {
  const response = await axios.delete(`${API_URL}/teams/${id}`);
  return response.data;
};

export const getMyTeams = async () => {
  const response = await axios.get(`${API_URL}/teams/my-teams`);
  return response.data;
};

export const getTeamMembers = async (id) => {
  const response = await axios.get(`${API_URL}/teams/${id}/members`);
  return response.data;
};

export const addTeamMember = async (id, memberData) => {
  const response = await axios.post(`${API_URL}/teams/${id}/members`, memberData);
  return response.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const response = await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const setTeamLeader = async (teamId, userId) => {
  const response = await axios.patch(`${API_URL}/teams/${teamId}/leader/${userId}`);
  return response.data;
};

export const getTeamsByDepartment = async (departmentId) => {
  const response = await axios.get(`${API_URL}/teams/department/${departmentId}`);
  return response.data;
};

export const getTeamsByEvent = async (eventId) => {
  const response = await axios.get(`${API_URL}/teams/event/${eventId}`);
  return response.data;
};

export const exportTeamsToCsv = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  window.location.href = `${API_URL}/teams/export?${params.toString()}`;
};

export const importTeamsFromCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/teams/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Event Services
export const getAllEvents = async () => {
  const response = await axios.get(`${API_URL}/events`);
  return response.data;
};

export const getActiveEvents = async () => {
  const response = await axios.get(`${API_URL}/events/active`);
  return response.data;
};

export const getEvent = async (id) => {
  const response = await axios.get(`${API_URL}/events/${id}`);
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await axios.post(`${API_URL}/events`, eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await axios.patch(`${API_URL}/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await axios.delete(`${API_URL}/events/${id}`);
  return response.data;
};

// Continuation of project-service.js...

// Event Services (continued)
export const publishResults = async (id, publishStatus = true) => {
  const response = await axios.patch(`${API_URL}/events/${id}/publish-results`, { publishResults: publishStatus });
  return response.data;
};

export const getEventSchedule = async (id) => {
  const response = await axios.get(`${API_URL}/events/${id}/schedule`);
  return response.data;
};

export const updateEventSchedule = async (id, scheduleData) => {
  const response = await axios.patch(`${API_URL}/events/${id}/schedule`, scheduleData);
  return response.data;
};

export const exportEventsToCsv = async () => {
  window.location.href = `${API_URL}/events/export`;
};

export const importEventsFromCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/events/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Location Services
export const getAllLocations = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  const response = await axios.get(`${API_URL}/locations?${params.toString()}`);
  return response.data;
};

export const getLocation = async (id) => {
  const response = await axios.get(`${API_URL}/locations/${id}`);
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await axios.post(`${API_URL}/locations`, locationData);
  return response.data;
};

export const createLocationBatch = async (batchData) => {
  const response = await axios.post(`${API_URL}/locations/batch`, batchData);
  return response.data;
};

export const updateLocation = async (id, locationData) => {
  const response = await axios.patch(`${API_URL}/locations/${id}`, locationData);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await axios.delete(`${API_URL}/locations/${id}`);
  return response.data;
};

export const assignProjectToLocation = async (locationId, projectId) => {
  const response = await axios.patch(`${API_URL}/locations/${locationId}/assign`, { projectId });
  return response.data;
};

export const unassignProjectFromLocation = async (locationId) => {
  const response = await axios.patch(`${API_URL}/locations/${locationId}/unassign`);
  return response.data;
};

export const getLocationsBySection = async (section) => {
  const response = await axios.get(`${API_URL}/locations/section/${section}`);
  return response.data;
};

export const getLocationsByDepartment = async (departmentId) => {
  const response = await axios.get(`${API_URL}/locations/department/${departmentId}`);
  return response.data;
};

export const getLocationsByEvent = async (eventId) => {
  const response = await axios.get(`${API_URL}/locations/event/${eventId}`);
  return response.data;
};

export const exportLocationsToCsv = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  window.location.href = `${API_URL}/locations/export?${params.toString()}`;
};

export const importLocationsFromCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/locations/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Utility function to generate empty templates for data import
export const generateEmptyProjectTemplate = () => {
  const emptyProject = {
    'Title': '',
    'Category': '',
    'Department': '',
    'Abstract': '',
    'Status': 'draft',
    'Power Required': 'No',
    'Internet Required': 'No', 
    'Special Space Required': 'No',
    'Other Requirements': '',
    'Guide Name': '',
    'Guide Department': '',
    'Guide Contact': '',
    'Team Name': '',
    'Event Name': ''
  };
  
  return new Blob([Object.keys(emptyProject).join(',') + '\n'], { type: 'text/csv' });
};

export const generateEmptyTeamTemplate = () => {
  const emptyTeam = {
    'Team Name': '',
    'Department': '',
    'Event': '',
    'Member 1 Name': '',
    'Member 1 Email': '',
    'Member 1 Enrollment': '',
    'Member 1 Role': 'Team Leader',
    'Member 1 Is Leader': 'Yes',
    'Member 2 Name': '',
    'Member 2 Email': '',
    'Member 2 Enrollment': '',
    'Member 2 Role': 'Member',
    'Member 2 Is Leader': 'No',
    'Member 3 Name': '',
    'Member 3 Email': '',
    'Member 3 Enrollment': '',
    'Member 3 Role': 'Member',
    'Member 3 Is Leader': 'No',
    'Member 4 Name': '',
    'Member 4 Email': '',
    'Member 4 Enrollment': '',
    'Member 4 Role': 'Member',
    'Member 4 Is Leader': 'No'
  };
  
  return new Blob([Object.keys(emptyTeam).join(',') + '\n'], { type: 'text/csv' });
};

export const generateEmptyLocationTemplate = () => {
  const emptyLocation = {
    'Section': '',
    'Position': '',
    'Department': '',
    'Event Name': ''
  };
  
  return new Blob([Object.keys(emptyLocation).join(',') + '\n'], { type: 'text/csv' });
};

export const generateEmptyEventTemplate = () => {
  const emptyEvent = {
    'Name': '',
    'Description': '',
    'Academic Year': '',
    'Event Date': '',
    'Registration Start Date': '',
    'Registration End Date': '',
    'Status': 'upcoming',
    'Departments': '' // Comma-separated department names
  };
  
  return new Blob([Object.keys(emptyEvent).join(',') + '\n'], { type: 'text/csv' });
};

// Bulk operations
export const bulkAssignLocations = async (assignments) => {
  const response = await axios.post(`${API_URL}/locations/bulk-assign`, { assignments });
  return response.data;
};

export const bulkEvaluateProjects = async (evaluations, evaluationType = 'department') => {
  const response = await axios.post(`${API_URL}/bulk-evaluate`, { 
    evaluations,
    evaluationType
  });
  return response.data;
};

export const autoAssignLocations = async (eventId, departmentWise = true) => {
  const response = await axios.post(`${API_URL}/locations/auto-assign`, { 
    eventId,
    departmentWise
  });
  return response.data;
};

// Mock Export - For exporting dummy data from frontend
export const exportDummyData = async (dataType = 'projects') => {
  switch (dataType) {
    case 'projects':
      window.location.href = `${API_URL}/dummy-export`;
      break;
    case 'teams':
      window.location.href = `${API_URL}/teams/dummy-export`;
      break;
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
};

export default {
  // Projects
  getAllProjects,
  getProject,
  getProjectWithDetails,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  evaluateProjectByDepartment,
  evaluateProjectByCentral,
  getProjectsForJury,
  getProjectsByDepartment,
  getProjectsByEvent,
  getProjectsByTeam,
  getProjectStatistics,
  getProjectCountsByCategory,
  getEventWinners,
  generateProjectCertificates,
  sendCertificateEmails,
  exportProjectsToCsv,
  importProjectsFromCsv,
  
  // Teams
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getMyTeams,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  setTeamLeader,
  getTeamsByDepartment,
  getTeamsByEvent,
  exportTeamsToCsv,
  importTeamsFromCsv,
  
  // Events
  getAllEvents,
  getActiveEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  publishResults,
  getEventSchedule,
  updateEventSchedule,
  exportEventsToCsv,
  importEventsFromCsv,
  
  // Locations
  getAllLocations,
  getLocation,
  createLocation,
  createLocationBatch,
  updateLocation,
  deleteLocation,
  assignProjectToLocation,
  unassignProjectFromLocation,
  getLocationsBySection,
  getLocationsByDepartment,
  getLocationsByEvent,
  exportLocationsToCsv,
  importLocationsFromCsv,
  
  // Templates
  generateEmptyProjectTemplate,
  generateEmptyTeamTemplate,
  generateEmptyLocationTemplate,
  generateEmptyEventTemplate,
  
  // Bulk operations
  bulkAssignLocations,
  bulkEvaluateProjects,
  autoAssignLocations,
  
  // Dummy data export
  exportDummyData
};