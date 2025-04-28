import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MapPin, Edit, RefreshCw, Check, X } from 'lucide-react';
import projectService from '../../../services/projectApi';
import { toast } from 'react-toastify';
import { Location as LocationType } from '../../../types/project.types';

interface LocationData {
  _id: string;
  locationId: string;
  section: string;
  position: number;
  department: any;
  eventId: string;
  projectId: any;
  isAssigned: boolean;
}

interface Project {
  _id: string;
  title: string;
  department: any;
  team: any;
}

const LocationAssignmentsTab: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('A');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [unassignedProjects, setUnassignedProjects] = useState<Project[]>([]);
  const [activeEvent, setActiveEvent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const events = await projectService.getActiveEvents();
        if (events && events.length > 0) {
          setActiveEvent(events[0]._id);
        }
      } catch (err) {
        console.error('Error fetching active events:', err);
      }
    };

    fetchActiveEvent();
  }, []);

  useEffect(() => {
    if (activeEvent) {
      const fetchSections = async () => {
        try {
          const response = await projectService.getAllLocations({ eventId: activeEvent });
          const allLocations = Array.isArray(response) ? response : [];
          const sections = Array.from(new Set(allLocations.map(loc => loc.section))).filter(Boolean);
          setAvailableSections(sections.sort());
        } catch (err) {
          console.error('Error fetching sections:', err);
          setAvailableSections([]);
        }
      };
      
      fetchSections();
    }
  }, [activeEvent]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllLocations({ 
        eventId: activeEvent,
        section: selectedSection
      });
      
      const data = Array.isArray(response) ? response : [];
      
      const locationData = data.map(loc => ({
        _id: loc._id || '',
        locationId: loc.locationId || '',
        section: loc.section || '',
        position: loc.position || 0,
        department: loc.department || null,
        eventId: loc.eventId || '',
        projectId: loc.projectId || null,
        isAssigned: !!loc.projectId
      }));

      const sortedLocations = locationData.sort((a, b) => a.position - b.position);
      setLocations(sortedLocations);
    } catch (err) {
      console.error('Error fetching locations:', err);
      toast.error('Failed to load locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedProjects = async () => {
    try {
      const response = await projectService.getAllProjects({ 
        eventId: activeEvent,
        status: 'approved'
      });
      
      const allProjects = Array.isArray(response) ? response : [];
      const unassigned = allProjects.filter(project => !project.locationId);
      setUnassignedProjects(unassigned);
    } catch (err) {
      console.error('Error fetching unassigned projects:', err);
      setUnassignedProjects([]);
    }
  };

  const handleAssignProject = async (location: LocationData, projectId: string) => {
    try {
      await projectService.assignProjectToLocation(location.locationId, projectId);
      toast.success('Project assigned successfully');
      await fetchLocationData();
      await fetchUnassignedProjects();
    } catch (err) {
      console.error('Error assigning project:', err);
      toast.error('Failed to assign project');
    }
  };

  const handleUnassignProject = async (location: LocationData) => {
    try {
      await projectService.unassignProjectFromLocation(location.locationId);
      toast.success('Project unassigned successfully');
      
      // Refresh data
      fetchLocationData();
      fetchUnassignedProjects();
    } catch (err) {
      console.error('Error unassigning project:', err);
      toast.error('Failed to unassign project');
    }
  };

  const handleAutoAssign = async () => {
    try {
      setLoading(true);
      await projectService.autoAssignLocations(activeEvent, true);
      toast.success('Projects auto-assigned successfully');
      
      // Refresh data
      fetchLocationData();
      fetchUnassignedProjects();
    } catch (err) {
      console.error('Error auto-assigning projects:', err);
      toast.error('Failed to auto-assign projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    try {
      // Find the highest position number in the current section
      const highestPosition = locations.length > 0 
        ? Math.max(...locations.map(loc => loc.position)) 
        : 0;
      
      // Get department ID from the first project (for simplicity)
      const departmentId = unassignedProjects.length > 0 
        ? (unassignedProjects[0].department._id || unassignedProjects[0].department) 
        : '';
      
      if (!departmentId) {
        toast.error('No department available for creating location');
        return;
      }
      
      // Create new location
      const newLocation = {
        locationId: `${selectedSection}-${String(highestPosition + 1).padStart(2, '0')}`,
        section: selectedSection,
        position: highestPosition + 1,
        department: departmentId,
        eventId: activeEvent
      };
      
      await projectService.createLocation(newLocation);
      toast.success('Location created successfully');
      
      // Refresh data
      fetchLocationData();
    } catch (err) {
      console.error('Error creating location:', err);
      toast.error('Failed to create location');
    }
  };

  const handleCreateBatch = async () => {
    try {
      // Get highest position number
      const highestPosition = locations.length > 0 
        ? Math.max(...locations.map(loc => loc.position)) 
        : 0;
      
      // Get department ID from the first project (for simplicity)
      const departmentId = unassignedProjects.length > 0 
        ? (unassignedProjects[0].department._id || unassignedProjects[0].department) 
        : '';
      
      if (!departmentId) {
        toast.error('No department available for creating locations');
        return;
      }
      
      // Prompt for number of stalls to create
      const numStalls = window.prompt('How many stalls do you want to create?');
      if (!numStalls || isNaN(parseInt(numStalls))) return;
      
      const count = parseInt(numStalls);
      
      // Create batch data as an array of location objects
      const batchData = Array.from({ length: count }, (_, i) => ({
        section: selectedSection,
        position: highestPosition + i + 1,
        department: departmentId,
        eventId: activeEvent,
        locationId: `${selectedSection}-${String(highestPosition + i + 1).padStart(2, '0')}`
      }));
      
      await projectService.createLocationBatch(batchData);
      toast.success(`Created ${count} locations successfully`);
      
      // Refresh data
      fetchLocationData();
    } catch (err) {
      console.error('Error creating location batch:', err);
      toast.error('Failed to create locations');
    }
  };

  // Filter locations by search term
  const filteredLocations = locations.filter(location => 
    location.locationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.projectId && 
     ((typeof location.projectId === 'object' && location.projectId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof location.projectId === 'string' && location.projectId.toLowerCase().includes(searchTerm.toLowerCase()))))
  );

  // Filter unassigned projects by search term
  const filteredUnassignedProjects = unassignedProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Location Assignments</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stalls or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
            onClick={handleAutoAssign}
            disabled={loading || unassignedProjects.length === 0}
          >
            <RefreshCw size={16} className="mr-1" />
            Auto Assign All
          </button>
          <button 
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
            onClick={handleCreateBatch}
          >
            <Plus size={16} className="mr-1" />
            Create Stalls
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
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {availableSections.map((section) => (
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
          
          {/* Add new section button */}
          <button
            className="py-2 px-4 text-center font-medium text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              const newSection = window.prompt('Enter new section name (single letter):');
              if (newSection && newSection.length === 1) {
                setSelectedSection(newSection.toUpperCase());
                // The new section will be created when a location is added
              }
            }}
          >
            + Add Section
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading location data...</div>
      ) : (
        <>
          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredLocations.map((location) => (
              <div 
                key={location._id}
                className={`p-4 rounded-lg border ${
                  location.isAssigned 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-500 mr-2" />
                    <span className="text-lg font-medium">Stall {location.locationId}</span>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-800">
                    {typeof location.department === 'string' 
                      ? location.department 
                      : location.department?.name || 'Unknown'}
                  </div>
                </div>
                
                {location.isAssigned && location.projectId ? (
                  <div>
                    <div className="text-sm font-semibold mb-1">
                      {typeof location.projectId === 'string' 
                        ? 'Project ID: ' + location.projectId 
                        : location.projectId.title}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {typeof location.projectId === 'string' 
                        ? 'Loading project details...'
                        : `${location.projectId._id} • ${
                            typeof location.projectId.team === 'string' 
                              ? location.projectId.team
                              : location.projectId.team?.name || 'Unknown Team'
                          }`
                      }
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                        onClick={() => {
                          setCurrentLocation(location);
                          setShowAssignModal(true);
                        }}
                      >
                        Change
                      </button>
                      <button 
                        className="text-xs px-2 py-1 text-red-600 hover:text-red-800 border border-red-200 rounded"
                        onClick={() => handleUnassignProject(location)}
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-500 mb-3">No project assigned</div>
                    <button 
                      className="w-full text-xs px-2 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                      onClick={() => {
                        setCurrentLocation(location);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign Project
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add new location button */}
            <div className="p-4 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
              <button 
                onClick={handleCreateLocation}
                className="text-blue-600 hover:text-blue-800 flex flex-col items-center"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-sm">Add New Stall</span>
              </button>
            </div>
          </div>
          
          {/* Unassigned Projects */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Unassigned Projects ({filteredUnassignedProjects.length})</h4>
            
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
                    {filteredUnassignedProjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          All projects have been assigned to locations
                        </td>
                      </tr>
                    ) : (
                      filteredUnassignedProjects.map((project) => (
                        <tr key={project._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project._id}
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
                            {typeof project.team === 'string' 
                              ? project.team 
                              : project.team?.name || 'Unknown Team'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              className="text-blue-600 hover:text-blue-900 text-sm"
                              onClick={() => {
                                // Find available location (first unassigned one)
                                const availableLocation = locations.find(loc => !loc.isAssigned);
                                if (availableLocation) {
                                  handleAssignProject(availableLocation, project._id);
                                } else {
                                  toast.warning('No available stalls. Please create more stalls in this section.');
                                }
                              }}
                            >
                              Assign Location
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
        </>
      )}

      {/* Project Assignment Modal */}
      {showAssignModal && currentLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Assign Project to Stall {currentLocation.locationId}</h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Project
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAssignProject(currentLocation, e.target.value);
                    setShowAssignModal(false);
                  }
                }}
              >
                <option value="" disabled>-- Select a project --</option>
                {unassignedProjects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title} - {typeof project.team === 'string' ? project.team : project.team?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // This is just a backup; the assignment happens on select change
                  const select = document.querySelector('select') as HTMLSelectElement;
                  if (select && select.value) {
                    handleAssignProject(currentLocation, select.value);
                    setShowAssignModal(false);
                  } else {
                    toast.warning('Please select a project');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAssignmentsTab;