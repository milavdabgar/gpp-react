import React, { useState } from 'react';
import { Search, Filter, FileText, User, MapPin, Award, Clock } from 'lucide-react';

interface ProjectListProps {
  onViewProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onViewProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample projects data - In production, this would come from an API
  const projects = [
    {
      id: 'NPNI-2025-0042',
      title: 'Smart Waste Management System',
      category: 'IoT & Smart Systems',
      department: 'Computer Engineering',
      team: 'Team Innovate',
      members: 3,
      location: 'Stall A-12',
      status: 'registered',
      abstract: 'A smart waste management system that uses IoT sensors to monitor waste levels in bins and optimize collection routes for municipal workers.'
    },
    {
      id: 'NPNI-2025-0056',
      title: 'Solar Powered Water Purifier',
      category: 'Sustainable Technology',
      department: 'Electrical Engineering',
      team: 'EcoSolutions',
      members: 4,
      location: 'Stall B-08',
      status: 'registered',
      abstract: 'A portable water purification system powered entirely by solar energy, designed for rural areas with limited electricity access.'
    },
    {
      id: 'NPNI-2025-0073',
      title: 'Structural Health Monitoring Device',
      category: 'Hardware Project',
      department: 'Civil Engineering',
      team: 'BuildTech',
      members: 2,
      location: 'Stall C-15',
      status: 'registered',
      abstract: 'A low-cost device that monitors the structural health of buildings and bridges, providing early warnings for potential failures.'
    }
  ];

  // Department options
  const departments = [
    'Computer Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Electronics & Communication'
  ];

  // Project categories
  const categories = [
    'Software Development',
    'Hardware Project',
    'IoT & Smart Systems',
    'Sustainable Technology',
    'Industry Problem Solution',
    'Research & Innovation'
  ];

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || project.department === filterDepartment;
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;

    return matchesSearch && matchesDepartment && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto">
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
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
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
                      {project.team} ({project.members} members)
                    </span>
                    <span className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {project.location}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{project.id}</span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.abstract}
              </p>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {project.department}
                </div>
                <button
                  onClick={() => onViewProject(project.id)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
