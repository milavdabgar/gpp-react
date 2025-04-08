import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, User, MapPin, Award, Clock } from 'lucide-react';
import { getProjectsByEvent, getEventWinners } from '../../../services/projectApi';
import { Project as ProjectType, Winner, ProjectEvent } from '../../../types/project.types';

interface ProjectListProps {
  onViewProject: (projectId: string) => void;
  event?: ProjectEvent;
}

// Extended Project interface with additional properties
interface ExtendedProject extends Omit<ProjectType, 'department'> {
  deptEvaluation?: {
    completed: boolean;
    score?: number;
  };
  centralEvaluation?: {
    completed: boolean;
    score?: number;
  };
  locationId?: {
    locationId: string;
  };
  teamId?: {
    name: string;
    members?: any[];
  };
  department?: {
    _id: string;
    name: string;
  };
}

const ProjectList: React.FC<ProjectListProps> = ({ onViewProject, event }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [winners, setWinners] = useState<ExtendedProject[]>([]);
  const [showWinners, setShowWinners] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!event?._id) return;
      
      try {
        setLoading(true);
        const data = await getProjectsByEvent(event._id);
        
        if (data && Array.isArray(data)) {
          // Convert the data to ExtendedProject type
          const extendedProjects = data.map(project => ({
            ...project,
            category: project.category || '',
            teamId: project.teamId || null,
            abstract: project.abstract || '',
            department: typeof project.department === 'string' 
              ? { _id: project.department, name: '' } 
              : project.department || { _id: '', name: '' }
          })) as ExtendedProject[];
          
          setProjects(extendedProjects);
          
          // Extract unique departments and categories
          const depts = new Set<string>();
          const cats = new Set<string>();
          
          extendedProjects.forEach(project => {
            if (project.department?.name) {
              depts.add(project.department.name);
            }
            if (project.category) {
              cats.add(project.category);
            }
          });
          
          setDepartments(Array.from(depts).sort());
          setCategories(Array.from(cats).sort());
        }
        
        // If results are published, fetch winners
        if (event.publishResults) {
          try {
            const winnersData = await getEventWinners(event._id);
            if (winnersData) {
              // Convert winners data to ExtendedProject type
              const extendedWinners = winnersData.map(winner => ({
                ...winner,
                category: winner.category || '',
                teamId: winner.teamId || null,
                abstract: winner.abstract || '',
                department: typeof winner.department === 'string' 
                  ? { _id: winner.department, name: '' } 
                  : winner.department || { _id: '', name: '' }
              })) as ExtendedProject[];
              
              setWinners(extendedWinners);
            }
          } catch (err) {
            console.error("Failed to fetch winners:", err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [event]);

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.teamId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === 'all' || 
      project.department?.name === filterDepartment;
    
    const matchesCategory = 
      filterCategory === 'all' || 
      project.category === filterCategory;

    return matchesSearch && matchesDepartment && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Winners Banner (if results are published) */}
      {event?.publishResults && winners.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-yellow-900">🏆 Project Fair Winners Announced!</h2>
            <button 
              onClick={() => setShowWinners(!showWinners)} 
              className="text-sm px-3 py-1 bg-white text-yellow-700 rounded-md hover:bg-yellow-50"
            >
              {showWinners ? 'Hide Winners' : 'View Winners'}
            </button>
          </div>
          
          {showWinners && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {winners.map((winner, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow">
                  <div className="text-sm text-yellow-700 font-medium">{winner.department?.name || 'Department'}</div>
                  <h3 className="font-bold truncate">{winner.title}</h3>
                  <div className="text-sm text-gray-600">{winner.teamId?.name || 'Team'}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <Award size={16} className="text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">Rank #{winner.rank}</span>
                    </div>
                    <button 
                      onClick={() => onViewProject(winner._id)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by title, team, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="md:w-64">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
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
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <FileText size={16} className="mr-1" />
                        {project.category}
                      </span>
                      <span className="flex items-center">
                        <User size={16} className="mr-1" />
                        {project.teamId?.name || 'No team'} 
                        {project.teamId?.members && `(${project.teamId.members.length} members)`}
                      </span>
                      <span className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        {project.locationId?.locationId || 'No location assigned'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{project._id}</span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.abstract}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {project.department?.name || 'Department not assigned'}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Evaluation Badges */}
                    <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                      {project.deptEvaluation?.completed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Award size={12} className="mr-1" />
                          Dept: {project.deptEvaluation.score}%
                        </span>
                      )}
                      {project.centralEvaluation?.completed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Award size={12} className="mr-1" />
                          Central: {project.centralEvaluation.score}%
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onViewProject(project._id)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Show count of displayed projects */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      )}
    </div>
  );
};

export default ProjectList;