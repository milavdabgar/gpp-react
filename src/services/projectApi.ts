import axios from '../utils/axios';
import { Project, Team, ProjectEvent, Location, ProjectStatistics, EvaluationData, CategoryCounts, Winner, EmailData } from '../types/project.types';

const API_URL = '/api/projects'; // This will be appended to baseURL from axios instance

// Project Services
interface Filters {
  [key: string]: string | number | boolean | undefined;
}

export const getAllProjects = async (filters: Filters = {}): Promise<Project[]> => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  const response = await axios.get<{ data: Project[] }>(`${API_URL}?${params.toString()}`);
  return response.data.data;
};

export const searchProjects = async (searchTerm: string): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/search?q=${searchTerm}`);
  return response.data.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await axios.get<{ data: Project }>(`${API_URL}/${id}`);
  return response.data.data;
};

export const getProjectWithDetails = async (id: string): Promise<Project> => {
  const response = await axios.get<{ data: Project }>(`${API_URL}/${id}/details`);
  return response.data.data;
};

export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  const response = await axios.post<{ data: Project }>(API_URL, projectData);
  return response.data.data;
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  const response = await axios.patch<{ data: Project }>(`${API_URL}/${id}`, projectData);
  return response.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const getMyProjects = async (): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/my-projects`);
  return response.data.data;
};

// Using EvaluationData from types/project.types.ts

export const evaluateProjectByDepartment = async (id: string, evaluationData: EvaluationData): Promise<Project> => {
  const response = await axios.post<{ data: Project }>(`${API_URL}/${id}/department-evaluation`, evaluationData);
  return response.data.data;
};

export const evaluateProjectByCentral = async (id: string, evaluationData: EvaluationData): Promise<Project> => {
  const response = await axios.post<{ data: Project }>(`${API_URL}/${id}/central-evaluation`, evaluationData);
  return response.data.data;
};

export const getProjectsForJury = async (evaluationType: 'department' | 'central' = 'department'): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/jury-assignments?evaluationType=${evaluationType}`);
  return response.data.data;
};

export const getProjectsByDepartment = async (departmentId: string): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/department/${departmentId}`);
  return response.data.data;
};

export const getProjectsByEvent = async (eventId: string): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/event/${eventId}`);
  return response.data.data;
};

export const getProjectsByTeam = async (teamId: string): Promise<Project[]> => {
  const response = await axios.get<{ data: Project[] }>(`${API_URL}/team/${teamId}`);
  return response.data.data;
};

// Using ProjectStatistics from types/project.types.ts

export const getProjectStatistics = async (eventId: string): Promise<ProjectStatistics> => {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await axios.get<{ data: ProjectStatistics }>(`${API_URL}/statistics${params}`);
  return response.data.data;
};

// Using CategoryCounts from project.types.ts

export const getProjectCountsByCategory = async (eventId: string): Promise<CategoryCounts> => {
  const params = eventId ? `?eventId=${eventId}` : '';
  const response = await axios.get<{ data: CategoryCounts }>(`${API_URL}/categories${params}`);
  return response.data.data;
};

// Using Winner from project.types.ts

export const getEventWinners = async (eventId: string): Promise<Winner[]> => {
  const response = await axios.get<{ data: Winner[] }>(`${API_URL}/event/${eventId}/winners`);
  return response.data.data;
};

export const generateProjectCertificates = async (eventId: string, type: 'participation' | 'winner' = 'participation'): Promise<string[]> => {
  const response = await axios.get<{ data: string[] }>(`${API_URL}/event/${eventId}/certificates?type=${type}`);
  return response.data.data;
};

// Using EmailData from types/project.types.ts

export const sendCertificateEmails = async (emailData: EmailData): Promise<void> => {
  await axios.post(`${API_URL}/certificates/send`, emailData);
};

export const exportProjectsToCsv = async () => {
  try {
    const filters: Record<string, string> = {};
    const params = new URLSearchParams();
    
    // Add all filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await axios.get(`${API_URL}/export?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create a blob from the response data
    const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
    
    // Create a link element and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'projects.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting projects:', error);
    throw error;
  }
};

interface SeedResponse {
  status: string;
  data: {
    departments: Array<{
      _id: string;
      name: string;
      code: string;
    }>;
    users: Array<{
      _id: string;
      name: string;
      department: string;
      contactNumber: string;
    }>;
    event: {
      _id: string;
    };
    teams: Array<{
      _id: string;
    }>;
  };
}

export const createSampleProjects = async () => {
  try {
    // First, seed the database with required data
    const seedResponse = await axios.post<SeedResponse>(`${API_URL}/seed`);
    const { departments, users, event, teams } = seedResponse.data.data;

    const sampleProjects = [
      {
        title: 'Smart Waste Management System',
        category: 'Environmental Technology',
        abstract: 'An IoT-based smart waste management system that optimizes collection routes and monitors fill levels.',
        department: departments[0]._id, // Computer Engineering
        status: 'submitted',
        requirements: {
          power: true,
          internet: true,
          specialSpace: false,
          otherRequirements: 'Requires outdoor testing area'
        },
        guide: {
          userId: users[0]._id,
          name: users[0].name,
          department: departments[0]._id,
          contactNumber: users[0].contactNumber
        },
        teamId: teams[0]._id,
        eventId: event._id,
        deptEvaluation: {
          completed: true,
          score: 85,
          feedback: 'Innovative solution with good technical implementation',
          juryId: users[0]._id,
          evaluatedAt: new Date('2025-04-05')
        },
        centralEvaluation: {
          completed: false,
          score: 0,
          feedback: '',
          juryId: null,
          evaluatedAt: null
        }
      },
      {
        title: 'Solar Powered Water Purifier',
        category: 'Renewable Energy',
        abstract: 'A sustainable water purification system powered entirely by solar energy.',
        department: departments[1]._id, // Electrical Engineering
        status: 'submitted',
        requirements: {
          power: false,
          internet: false,
          specialSpace: true,
          otherRequirements: 'Needs direct sunlight exposure'
        },
        guide: {
          userId: users[1]._id,
          name: users[1].name,
          department: departments[1]._id,
          contactNumber: users[1].contactNumber
        },
        teamId: teams[1]._id,
        eventId: event._id,
        deptEvaluation: {
          completed: true,
          score: 92,
          feedback: 'Excellent project with significant environmental impact',
          juryId: users[1]._id,
          evaluatedAt: new Date('2025-04-05')
        },
        centralEvaluation: {
          completed: false,
          score: 0,
          feedback: '',
          juryId: null,
          evaluatedAt: null
        }
      }
    ];

    // Create each project
    const createdProjects = await Promise.all(
      sampleProjects.map(project => 
        axios.post(`${API_URL}`, project)
      )
    );

    return createdProjects.map(response => response.data);
  } catch (error) {
    console.error('Error creating sample projects:', error);
    throw error;
  }
};

export const importProjectsFromCsv = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error importing projects:', error);
    throw error;
  }
};

export const getAllTeams = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  const response = await axios.get(`${API_URL}/teams?${params.toString()}`);
  return response.data;
};

export const getTeam = async (id: string): Promise<Team> => {
  const response = await axios.get<{ data: Team }>(`${API_URL}/teams/${id}`);
  return response.data.data;
};

export const createTeam = async (teamData: Partial<Team>): Promise<Team> => {
  const response = await axios.post<{ data: Team }>(`${API_URL}/teams`, teamData);
  return response.data.data;
};

export const updateTeam = async (id: string, teamData: Partial<Team>): Promise<Team> => {
  const response = await axios.patch<{ data: Team }>(`${API_URL}/teams/${id}`, teamData);
  return response.data.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/teams/${id}`);
};

export const getMyTeams = async (): Promise<Team[]> => {
  const response = await axios.get<{ data: Team[] }>(`${API_URL}/teams/my-teams`);
  return response.data.data;
};

export const getTeamMembers = async (id: string): Promise<string[]> => {
  const response = await axios.get<{ data: string[] }>(`${API_URL}/teams/${id}/members`);
  return response.data.data;
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await axios.post(`${API_URL}/teams/${teamId}/members`, { userId });
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`);
};

export const setTeamLeader = async (teamId: string, userId: string): Promise<void> => {
  await axios.patch(`${API_URL}/teams/${teamId}/leader/${userId}`);
};

export const getTeamsByDepartment = async (departmentId: string): Promise<Team[]> => {
  const response = await axios.get<{ data: Team[] }>(`${API_URL}/teams/department/${departmentId}`);
  return response.data.data;
};

export const getTeamsByEvent = async (eventId: string): Promise<Team[]> => {
  const response = await axios.get<{ data: Team[] }>(`${API_URL}/teams/event/${eventId}`);
  return response.data.data;
};

export const exportTeamsToCsv = async (filters: Record<string, any> = {}) => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string);
  });
  
  window.location.href = `${API_URL}/teams/export?${params.toString()}`;
};

export const importTeamsFromCsv = async (file: File): Promise<Team[]> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post<{ data: Team[] }>(`${API_URL}/teams/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

// ...continued

// Event Services
export const getAllEvents = async (): Promise<ProjectEvent[]> => {
  const response = await axios.get<{ data: ProjectEvent[] }>(`${API_URL}/events`);
  return response.data.data;
};

interface APIResponse<T> {
  status: string;
  data: T;
}

export const getActiveEvents = async (): Promise<ProjectEvent[]> => {
  const response = await axios.get<APIResponse<{ events: ProjectEvent[] }>>(`${API_URL}/events/active`);
  return response.data.data.events;
};

export const getEvent = async (id: string): Promise<ProjectEvent> => {
  const response = await axios.get<{ data: ProjectEvent }>(`${API_URL}/events/${id}`);
  return response.data.data;
};

export const createEvent = async (eventData: Partial<ProjectEvent>): Promise<ProjectEvent> => {
  const response = await axios.post<{ data: ProjectEvent }>(`${API_URL}/events`, eventData);
  return response.data.data;
};

export const updateEvent = async (id: string, eventData: Partial<ProjectEvent>): Promise<ProjectEvent> => {
  const response = await axios.patch<{ data: ProjectEvent }>(`${API_URL}/events/${id}`, eventData);
  return response.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/events/${id}`);
};

// Continuation of project-service.js...

// Event Services (continued)
export const publishResults = async (id: string, publishStatus = true): Promise<ProjectEvent> => {
  const response = await axios.patch<{ data: ProjectEvent }>(`${API_URL}/events/${id}/publish`, { publish: publishStatus });
  return response.data.data;
};

export const getEventSchedule = async (id: string): Promise<any> => {
  const response = await axios.get<{ data: any }>(`${API_URL}/events/${id}/schedule`);
  return response.data.data;
};

export const updateEventSchedule = async (id: string, scheduleData: any): Promise<any> => {
  const response = await axios.patch<{ data: any }>(`${API_URL}/events/${id}/schedule`, scheduleData);
  return response.data.data;
};

export const exportEventsToCsv = async (): Promise<string> => {
  const response = await axios.get<{ data: string }>(`${API_URL}/events/export`, { responseType: 'blob' });
  return response.data.data;
};

export const importEventsFromCsv = async (file: File): Promise<ProjectEvent[]> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<{ data: ProjectEvent[] }>(`${API_URL}/events/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

// Location Services
export const getAllLocations = async (filters: Filters = {}): Promise<Location[]> => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get<{ data: Location[] }>(`${API_URL}/locations?${params.toString()}`);
  return response.data.data;
};

export const getLocation = async (id: string): Promise<Location> => {
  const response = await axios.get<{ data: Location }>(`${API_URL}/locations/${id}`);
  return response.data.data;
};

export const createLocation = async (locationData: Partial<Location>): Promise<Location> => {
  const response = await axios.post<{ data: Location }>(`${API_URL}/locations`, locationData);
  return response.data.data;
};

export const createLocationBatch = async (batchData: Partial<Location>[]): Promise<Location[]> => {
  const response = await axios.post<{ data: Location[] }>(`${API_URL}/locations/batch`, batchData);
  return response.data.data;
};

export const updateLocation = async (id: string, locationData: Partial<Location>): Promise<Location> => {
  const response = await axios.patch<{ data: Location }>(`${API_URL}/locations/${id}`, locationData);
  return response.data.data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/locations/${id}`);
};

export const assignProjectToLocation = async (locationId: string, projectId: string): Promise<Location> => {
  const response = await axios.post<{ data: Location }>(`${API_URL}/locations/${locationId}/assign`, { projectId });
  return response.data.data;
};

export const unassignProjectFromLocation = async (locationId: string): Promise<Location> => {
  const response = await axios.post<{ data: Location }>(`${API_URL}/locations/${locationId}/unassign`, {});
  return response.data.data;
};

export const getLocationsBySection = async (section: string): Promise<Location[]> => {
  const response = await axios.get<{ data: Location[] }>(`${API_URL}/locations/section/${section}`);
  return response.data.data;
};

export const getLocationsByDepartment = async (departmentId: string): Promise<Location[]> => {
  const response = await axios.get<{ data: Location[] }>(`${API_URL}/locations/department/${departmentId}`);
  return response.data.data;
};

export const getLocationsByEvent = async (eventId: string): Promise<Location[]> => {
  const response = await axios.get<{ data: Location[] }>(`${API_URL}/locations/event/${eventId}`);
  return response.data.data;
};

export const exportLocationsToCsv = async (filters: Filters = {}): Promise<string> => {
  const params = new URLSearchParams();
  
  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get<{ data: string }>(`${API_URL}/locations/export?${params.toString()}`, { responseType: 'blob' });
  return response.data.data;
};

export const importLocationsFromCsv = async (file: File): Promise<Location[]> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post<{ data: Location[] }>(`${API_URL}/locations/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
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
interface LocationAssignment {
  locationId: string;
  projectId: string;
}

export const bulkAssignLocations = async (assignments: LocationAssignment[]): Promise<Location[]> => {
  const response = await axios.post<{ data: Location[] }>(`${API_URL}/locations/bulk-assign`, { assignments });
  return response.data.data;
};

interface ProjectEvaluation {
  projectId: string;
  score: number;
  feedback?: string;
  criteria?: Record<string, number>;
}

export const bulkEvaluateProjects = async (evaluations: ProjectEvaluation[], evaluationType: 'department' | 'central' = 'department'): Promise<any> => {
  const response = await axios.post<{ data: any }>(`${API_URL}/bulk-evaluate`, {
    evaluations,
    evaluationType
  });
  return response.data;
};

export const autoAssignLocations = async (eventId: string, departmentWise: boolean = true): Promise<any> => {
  const response = await axios.post<{ data: any }>(`${API_URL}/locations/auto-assign`, {
    eventId,
    departmentWise
  });
  return response.data;
};

// Mock Export - For exporting dummy data from frontend
export const exportDummyData = async (dataType = 'projects'): Promise<void> => {
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

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  department?: string;
}

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await axios.get<{ data: { users: User[] } }>(`/api/admin/users?role=${role}`);
  return response.data.data.users;
};

interface DepartmentResponse {
  data: {
    departments: Array<{
      _id: string;
      name: string;
      code: string;
    }>;
  };
}

export const getDepartments = async () => {
  const response = await axios.get<DepartmentResponse>('/api/departments');
  return response.data.data.departments;
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
  exportDummyData,

  // Users
  getUsersByRole,
  getDepartments,
}