import React, { useState } from 'react';
import { Search, Filter, Plus, MapPin, Edit, RefreshCw, Check, X } from 'lucide-react';

const LocationAssignmentsTab = () => {
  const [selectedSection, setSelectedSection] = useState('A');
  
  // Sample locations (stalls)
  const locations = [
    { id: 'A-12', project: 'NPNI-2025-0042', title: 'Smart Waste Management System', department: 'Computer Engineering', team: 'Team Innovate', assigned: true },
    { id: 'A-13', project: null, department: 'Computer Engineering', assigned: false },
    { id: 'A-14', project: 'NPNI-2025-0018', title: 'AI-Based Attendance System', department: 'Computer Engineering', team: 'CodeCrafters', assigned: true },
    { id: 'A-15', project: null, department: 'Computer Engineering', assigned: false },
    { id: 'B-08', project: 'NPNI-2025-0056', title: 'Solar Powered Water Purifier', department: 'Electrical Engineering', team: 'EcoSolutions', assigned: true },
    { id: 'B-09', project: 'NPNI-2025-0031', title: 'Smart Energy Monitor', department: 'Electrical Engineering', team: 'PowerTech', assigned: true },
    { id: 'B-10', project: null, department: 'Electrical Engineering', assigned: false },
    { id: 'C-15', project: 'NPNI-2025-0073', title: 'Structural Health Monitoring Device', department: 'Civil Engineering', team: 'BuildTech', assigned: true },
    { id: 'C-16', project: null, department: 'Civil Engineering', assigned: false }
  ];
  
  // Sample unassigned projects
  const unassignedProjects = [
    { id: 'NPNI-2025-0027', title: 'Student Performance Analytics', department: 'Computer Engineering', team: 'DataMinds' },
    { id: 'NPNI-2025-0047', title: 'Automatic Street Light System', department: 'Electrical Engineering', team: 'LightWay' }
  ];
  
  // Filter locations by selected section
  const filteredLocations = locations.filter(location => location.id.startsWith(selectedSection));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Location Assignments</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stalls or projects..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center">
            <RefreshCw size={16} className="mr-1" />
            Auto Assign All
          </button>
        </div>
      </div>
      
      {/* Layout Legend */}
      <div className="mb-4 flex items-center space-x-4">
        <div className="text-sm text-gray-700">Layout Legend:</div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-1"></div>
          <span className="text-sm text-gray-600">Assigned</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-1"></div>
          <span className="text-sm text-gray-600">Unassigned</span>
        </div>
      </div>
      
      {/* Section Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {['A', 'B', 'C', 'D'].map((section) => (
            <button
              key={section}
              className={`py-2 px-4 text-center font-medium text-sm ${
                selectedSection === section
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSection(section)}
            >
              Section {section}
            </button>
          ))}
        </div>
      </div>
      
      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredLocations.map((location) => (
          <div 
            key={location.id}
            className={`p-4 rounded-lg border ${
              location.assigned 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-500 mr-2" />
                <span className="text-lg font-medium">Stall {location.id}</span>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-800">
                {location.department}
              </div>
            </div>
            
            {location.assigned ? (
              <div>
                <div className="text-sm font-semibold mb-1">{location.title}</div>
                <div className="text-xs text-gray-500 mb-3">
                  {location.project} • {location.team}
                </div>
                <div className="flex justify-end space-x-2">
                  <button className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded">
                    Change
                  </button>
                  <button className="text-xs px-2 py-1 text-red-600 hover:text-red-800 border border-red-200 rounded">
                    Unassign
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-500 mb-3">No project assigned</div>
                <button className="w-full text-xs px-2 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                  Assign Project
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Unassigned Projects */}
      <div>
        <h4 className="font-medium text-gray-700 mb-4">Unassigned Projects ({unassignedProjects.length})</h4>
        
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unassignedProjects.map((project, index) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">
                        Assign Location
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationAssignmentsTab;
