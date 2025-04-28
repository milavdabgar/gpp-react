import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Map, 
  Download, 
  Upload,
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  User,
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Calendar
} from 'lucide-react';
import LocationAssignmentsTab from './LocationAssignmentsTab';
import ScheduleTab from './ScheduleTab';
import ResultsCertificatesTab from './ResultsCertificatesTab';
import CreateEventForm from './CreateEventForm';
import ProjectForm from './ProjectForm';
import projectService from '../../../services/projectApi';
import { Project, Team, ProjectEvent, ProjectStatistics, CategoryCounts } from '../../../types/project.types';
import { toast } from 'react-toastify';
import { useToast } from '../../../context/ToastContext';

interface JuryMember {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  department: string;
}

interface ProjectFairAdminProps {
  event: ProjectEvent;
}

export default function ProjectFairAdmin({ event }: ProjectFairAdminProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts | null>(null);
  const [eventSchedule, setEventSchedule] = useState<any[]>([]);
  const [activeEvent, setActiveEvent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [evaluationFilter, setEvaluationFilter] = useState<string>('all');
  const [departmentProjectsData, setDepartmentProjectsData] = useState<{ department: string; count: number; evaluatedCount: number }[]>([]);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);

  // Initialize with the provided event
  useEffect(() => {
    if (event?._id) {
      console.log('Initializing with event:', event);
      setEvents([event]);
      setActiveEvent(event._id);
      fetchProjectData();
    }
  }, [event]);

  // Load projects when active event changes
  useEffect(() => {
    if (activeEvent) {
      fetchProjectData();
    }
  }, [activeEvent]);

  // Load data based on active tab
  useEffect(() => {
    if (activeEvent) {
      if (activeTab === 'overview') {
        fetchStats();
        fetchCategoryCounts();
        fetchEventSchedule();
      } else if (activeTab === 'jury') {
        fetchJuryMembers();
      } else if (activeTab === 'teams') {
        fetchTeams();
      }
    }
  }, [activeTab, activeEvent]);

  // Fetch project data with filters
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = { eventId: activeEvent };
      
      if (departmentFilter !== 'all') filters.department = departmentFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (evaluationFilter === 'pendingDept') filters.deptEvaluationStatus = 'pending';
      if (evaluationFilter === 'completedDept') filters.deptEvaluationStatus = 'completed';
      if (evaluationFilter === 'pendingCentral') filters.centralEvaluationStatus = 'pending';
      if (evaluationFilter === 'completedCentral') filters.centralEvaluationStatus = 'completed';
      
      const response = await projectService.getAllProjects(filters);
      // Ensure response is properly handled and projects is always an array
      setProjects(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setProjects([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await projectService.getProjectStatistics(activeEvent);
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const data = await projectService.getProjectCountsByCategory(activeEvent);
      setCategoryCounts(data);
    } catch (err) {
      console.error('Error fetching category counts:', err);
    }
  };

  const fetchEventSchedule = async () => {
    try {
      if (activeEvent) {
        const data = await projectService.getEventSchedule(activeEvent);
        setEventSchedule(data?.schedule || []);
      }
    } catch (err) {
      console.error('Error fetching event schedule:', err);
    }
  };

  const fetchJuryMembers = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUsersByRole('jury');
      // Map User data to JuryMember format
      const juryData = Array.isArray(response) ? response.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department || 'Unknown',
        roles: user.roles
      })) : [];
      setJuryMembers(juryData);
      setError(null);
    } catch (err) {
      console.error('Error fetching jury members:', err);
      setError('Failed to load jury members');
      setJuryMembers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const teams = await projectService.getTeamsByEvent(activeEvent);
      setTeams(teams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const handleExport = async () => {
    try {
      await projectService.exportProjectsToCsv();
      toast.success('Projects exported successfully');
    } catch (err) {
      console.error('Error exporting projects:', err);
      toast.error('Failed to export projects');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      const result = await projectService.importProjectsFromCsv(file);
      if (result && typeof result === 'object' && 'imported' in result) {
        toast.success(`Imported ${result.imported} projects successfully`);
      } else {
        toast.success('Projects imported successfully');
      }
      
      // Refresh data
      fetchProjectData();
    } catch (err) {
      console.error('Error importing projects:', err);
      toast.error('Failed to import projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleProjects = async () => {
    try {
      setLoading(true);
      // Create a sample project using the available createProject function
      await projectService.createProject({
        title: 'Sample Project',
        description: 'This is a sample project',
        department: 'Sample Department',
        team: 'Sample Team',
        status: 'pending'
      });
      toast.success('Sample project created successfully');
      fetchProjectData();
    } catch (error) {
      console.error('Error creating sample project:', error);
      toast.error('Failed to create sample project');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDummyData = async (dataType: 'projects' | 'teams' = 'projects') => {
    try {
      await projectService.exportProjectsToCsv();
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        toast.success('Project deleted successfully');
        
        // Refresh project list
        fetchProjectData();
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = () => {
    fetchProjectData();
  };

  // Fetch department data
  const fetchDepartmentData = async () => {
    try {
      const response = await projectService.getAllProjects({ eventId: activeEvent });
      const projects = Array.isArray(response) ? response : [];
      
      if (projects.length === 0) {
        setDepartmentProjectsData([]);
        return;
      }

      const departmentCounts = projects.reduce<Record<string, { count: number; evaluatedCount: number }>>((acc, project) => {
        // Handle both string and object department values
        const deptName = typeof project.department === 'string' 
          ? project.department 
          : project.department?.name || 'Unknown';

        if (!acc[deptName]) {
          acc[deptName] = { count: 0, evaluatedCount: 0 };
        }
        acc[deptName].count += 1;

        // Check for evaluation completion
        const isEvaluated = project.deptEvaluation?.completed || project.centralEvaluation?.completed;
        if (isEvaluated) {
          acc[deptName].evaluatedCount += 1;
        }
        return acc;
      }, {});
      
      const departmentData = Object.entries(departmentCounts).map(([department, stats]) => ({
        department,
        count: stats.count,
        evaluatedCount: stats.evaluatedCount
      }));
      
      setDepartmentProjectsData(departmentData);
    } catch (err) {
      console.error('Error fetching department data:', err);
      setDepartmentProjectsData([]);
    }
  };

  // Load department data when active event changes
  useEffect(() => {
    if (activeEvent) {
      fetchDepartmentData();
    }
  }, [activeEvent]);

  // Format departments data for overview
  useEffect(() => {
    if (statistics?.departmentWise) {
      const updatedDepartmentData = Object.entries(statistics.departmentWise).map(([dept, count]) => ({
        department: dept,
        count,
        evaluatedCount: departmentProjectsData.find(d => d.department === dept)?.evaluatedCount || 0
      }));
      setDepartmentProjectsData(updatedDepartmentData);
    }
  }, [statistics?.departmentWise]);

  const handleEventCreated = async (newEvent: ProjectEvent) => {
    try {
      console.log('Event created:', newEvent);
      // Fetch active events to get the latest data
      const activeEvents = await projectService.getActiveEvents();
      console.log('Active events fetched:', activeEvents);
      
      if (activeEvents && activeEvents.length > 0) {
        console.log('Setting events from active events:', activeEvents);
        setEvents(activeEvents);
        console.log('Setting active event to:', activeEvents[0]._id);
        setActiveEvent(activeEvents[0]._id);
      } else {
        console.log('No active events found, using newly created event');
        setEvents([newEvent]);
        console.log('Setting active event to:', newEvent._id);
        setActiveEvent(newEvent._id);
      }
      setShowCreateEventForm(false);
      showToast('Event created successfully!', 'success');
    } catch (err) {
      console.error('Error fetching active events:', err);
      showToast('Failed to load active events', 'error');
    }
  };

  const renderNoEventMessage = () => {
    console.log('Rendering no event message. activeEvent:', activeEvent, 'events:', events);
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No active project fair event found.</h3>
        <p className="text-gray-600 mb-4">Please create a new event to get started.</p>
        <button
          onClick={() => setShowCreateEventForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Event
        </button>
      </div>
    );
  };

  if (showCreateEventForm) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <CreateEventForm
          onEventCreated={handleEventCreated}
          onCancel={() => setShowCreateEventForm(false)}
        />
      </div>
    );
  }

  if (!activeEvent) {
    return renderNoEventMessage();
  }

  // Render the Overview tab content
  const renderOverviewTab = () => (
    <div>
      {/* Key Stats */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Event Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Award className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <div className="text-sm text-blue-500">Total Projects</div>
                <div className="text-2xl font-bold text-blue-700">{statistics?.total || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-sm text-green-500">Evaluated Projects</div>
                <div className="text-2xl font-bold text-green-700">{statistics?.evaluated || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <div className="text-sm text-purple-500">Average Score</div>
                <div className="text-2xl font-bold text-purple-700">{statistics?.averageScore ? `${statistics.averageScore.toFixed(1)}%` : 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <div className="text-sm text-yellow-500">Pending Evaluations</div>
                <div className="text-2xl font-bold text-yellow-700">{statistics?.pending || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <div className="text-sm text-red-500">Departments</div>
                <div className="text-2xl font-bold text-red-700">{departmentProjectsData.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-lg mr-4">
                <Map className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Categories</div>
                <div className="text-2xl font-bold text-gray-700">
                  {categoryCounts ? Object.keys(categoryCounts).length : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects by Department */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Projects by Department</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          {departmentProjectsData.map((dept, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{dept.department}</span>
                <span className="text-sm text-gray-500">{dept.evaluatedCount}/{dept.count} evaluated</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${(dept.count / (statistics?.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}

          {departmentProjectsData.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No department data available
            </div>
          )}
        </div>
      </div>
      
      {/* Event Schedule */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Event Schedule</h3>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar size={14} className="mr-1" />
            View Full Schedule
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinator
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventSchedule.length > 0 ? (
                  eventSchedule.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.activity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.coordinator?.name || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No schedule items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Project Registrations</h3>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setActiveTab('projects')}
          >
            View All Projects
          </button>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading projects...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No projects found</div>
          ) : (
            projects.slice(0, 5).map((project, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span className="mr-3">
                      {typeof project.department === 'string' 
                        ? project.department 
                        : project.department?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <User size={14} className="mr-1" />
                      {typeof project.team === 'string' ? project.team : project.team.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">ID: {project.id || project._id}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.deptEvaluation?.completed 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Dept: {project.deptEvaluation?.completed 
                        ? `${project.deptEvaluation.score}%` 
                        : 'Pending'}
                    </span>
                    <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.centralEvaluation?.completed 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Central: {project.centralEvaluation?.completed 
                        ? `${project.centralEvaluation.score}%` 
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  
  // Render the Projects tab content
  const renderProjectsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Project Management</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowProjectForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
              disabled={loading}
            >
              <Plus size={16} className="mr-2" />
              Add New Project
            </button>
            <label className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm cursor-pointer">
              <Upload size={16} className="mr-2" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                disabled={loading}
              />
            </label>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
              disabled={loading}
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-700 mr-2">Filter By:</div>
        
        <select 
          className="text-sm border border-gray-300 rounded-md p-2 bg-white"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          onBlur={handleFilterChange}
        >
          <option value="all">All Departments</option>
          {departmentProjectsData.map((dept, index) => (
            <option key={index} value={dept.department}>{dept.department}</option>
          ))}
        </select>
        
        <select 
          className="text-sm border border-gray-300 rounded-md p-2 bg-white"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          onBlur={handleFilterChange}
        >
          <option value="all">All Categories</option>
          {categoryCounts && Object.keys(categoryCounts).map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
        
        <select 
          className="text-sm border border-gray-300 rounded-md p-2 bg-white"
          value={evaluationFilter}
          onChange={(e) => setEvaluationFilter(e.target.value)}
          onBlur={handleFilterChange}
        >
          <option value="all">All Evaluation Status</option>
          <option value="pendingDept">Pending Department Evaluation</option>
          <option value="completedDept">Completed Department Evaluation</option>
          <option value="pendingCentral">Pending Central Evaluation</option>
          <option value="completedCentral">Completed Central Evaluation</option>
        </select>
        
        <button 
          onClick={handleFilterChange}
          className="px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
        >
          Apply Filters
        </button>
      </div>
      
      {/* Project Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluation Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading projects...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.id || project._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof project.department === 'string' 
                        ? project.department 
                        : project.department?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof project.team === 'string' ? project.team : project.team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.locationId ? (typeof project.locationId === 'string' ? project.locationId : project.locationId?.locationId) : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.deptEvaluation?.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Dept: {project.deptEvaluation?.completed ? `${project.deptEvaluation.score}%` : 'Pending'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.centralEvaluation?.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Central: {project.centralEvaluation?.completed ? `${project.centralEvaluation.score}%` : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            // Navigate to edit project page or show modal
                            console.log('Edit project:', project._id);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination can be added here if needed */}
      </div>
    </div>
  );
  
  // Render the Jury Management tab content
  const renderJuryTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Jury Management</h3>
        <button 
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
          onClick={() => {
            // Navigate to add jury page or show modal
            console.log('Add jury member');
          }}
        >
          <Plus size={16} className="mr-1" />
          Add Jury Member
        </button>
      </div>
      
      {/* Jury Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <div className="text-sm text-blue-500">Department Jury</div>
              <div className="text-2xl font-bold text-blue-700">
                {juryMembers.filter(j => !j.roles.includes('admin')).length || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Award className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <div className="text-sm text-purple-500">Central Experts</div>
              <div className="text-2xl font-bold text-purple-700">
                {juryMembers.filter(j => j.roles.includes('admin')).length || 0}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <div className="text-sm text-green-500">Evaluations Completed</div>
              <div className="text-2xl font-bold text-green-700">
                {statistics?.evaluated || 0}/{statistics?.total || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Jury List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {juryMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No jury members found
                  </td>
                </tr>
              ) : (
                juryMembers.map((jury, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jury._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {jury.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jury.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        jury.roles.includes('admin') 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {jury.roles.includes('admin') ? 'Central Expert' : 'Department'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {jury.department || 'All Departments'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">0/0</span>
                        <div className="ml-2 w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600" 
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800">
                        Assign Projects
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Use the existing LocationAssignmentsTab component
  const renderLocationsTab = () => (
    <LocationAssignmentsTab />
  );
  
  // Use the existing ScheduleTab component
  const renderScheduleTab = () => (
    <ScheduleTab />
  );

  // Use the existing ResultsCertificatesTab component
  const renderResultsTab = () => (
    <ResultsCertificatesTab />
  );
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'projects':
        return renderProjectsTab();
      case 'jury':
        return renderJuryTab();
      case 'locations':
        return renderLocationsTab();
      case 'schedule':
        return renderScheduleTab();
      case 'results':
        return renderResultsTab();
      default:
        return <div>Invalid tab</div>;
    }
  };

  // Update fetchProjectData to be callable from ProjectForm
  const handleProjectCreated = () => {
    fetchProjectData();
  };

  return (
    <div className="p-4">
      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onProjectCreated={handleProjectCreated}
          eventId={activeEvent}
        />
      )}
      {/* Rest of the existing JSX */}
      {/* Event Selector */}
      {events.length > 0 && (
        <div className="mb-4">
          <label htmlFor="event-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Select Event:
          </label>
          <select
            id="event-selector"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            value={activeEvent}
            onChange={(e) => setActiveEvent(e.target.value)}
          >
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title} ({new Date(event.startDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('jury')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'jury' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Jury
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'locations' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Locations
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded mb-2 ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Results & Certificates
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}