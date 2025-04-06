import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Map, 
  BarChart, 
  ChevronDown, 
  Settings, 
  Download, 
  Filter, 
  Mail, 
  Clipboard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Activity, 
  User,
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Calendar, 
  Info 
} from 'lucide-react';

const ProjectFairAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample statistics data
  const stats = {
    totalProjects: 42,
    totalDepartments: 5,
    totalJuries: 16,
    registrationsToday: 8,
    pendingEvaluations: 24,
    completedEvaluations: 18
  };
  
  // Sample projects by department
  const departmentProjects = [
    { department: 'Computer Engineering', count: 15, evaluatedCount: 7 },
    { department: 'Electrical Engineering', count: 10, evaluatedCount: 5 },
    { department: 'Civil Engineering', count: 8, evaluatedCount: 3 },
    { department: 'Mechanical Engineering', count: 6, evaluatedCount: 2 },
    { department: 'Electronics & Communication', count: 3, evaluatedCount: 1 }
  ];
  
  // Sample project list
  const projects = [
    {
      id: 'NPNI-2025-0042',
      title: 'Smart Waste Management System',
      department: 'Computer Engineering',
      team: 'Team Innovate',
      members: 3,
      location: 'Stall A-12',
      registrationDate: '2025-04-01',
      departmentEvaluation: { status: 'completed', score: 85 },
      centralEvaluation: { status: 'pending', score: null }
    },
    {
      id: 'NPNI-2025-0056',
      title: 'Solar Powered Water Purifier',
      department: 'Electrical Engineering',
      team: 'EcoSolutions',
      members: 4,
      location: 'Stall B-08',
      registrationDate: '2025-04-02',
      departmentEvaluation: { status: 'completed', score: 92 },
      centralEvaluation: { status: 'pending', score: null }
    },
    {
      id: 'NPNI-2025-0073',
      title: 'Structural Health Monitoring Device',
      department: 'Civil Engineering',
      team: 'BuildTech',
      members: 2,
      location: 'Stall C-15',
      registrationDate: '2025-04-03',
      departmentEvaluation: { status: 'completed', score: 78 },
      centralEvaluation: { status: 'pending', score: null }
    }
  ];
  
  // Sample jury members
  const juryMembers = [
    { 
      id: 'J001', 
      name: 'Dr. Amit Patel', 
      type: 'department', 
      department: 'Computer Engineering', 
      email: 'amit.patel@gppalanpur.ac.in',
      assignedProjects: 5,
      evaluatedProjects: 3
    },
    { 
      id: 'J002', 
      name: 'Prof. Sanjay Mehta', 
      type: 'department', 
      department: 'Electrical Engineering', 
      email: 'sanjay.mehta@gppalanpur.ac.in',
      assignedProjects: 4,
      evaluatedProjects: 2
    },
    { 
      id: 'J003', 
      name: 'Dr. Priya Sharma', 
      type: 'central', 
      department: 'External - IIT Gandhinagar', 
      email: 'priya.sharma@iitgn.ac.in',
      assignedProjects: 6,
      evaluatedProjects: 0
    }
  ];
  
  // Sample event schedule
  const eventSchedule = [
    { time: '08:30 AM - 09:30 AM', activity: 'Setup and Registration', location: 'Main Hall Entrance' },
    { time: '09:30 AM - 10:00 AM', activity: 'Inauguration Ceremony', location: 'Auditorium' },
    { time: '10:00 AM - 12:00 PM', activity: 'Department Jury Evaluation', location: 'Project Stalls' },
    { time: '12:00 PM - 01:00 PM', activity: 'Lunch Break', location: 'Cafeteria' },
    { time: '01:00 PM - 02:00 PM', activity: 'Open Viewing for Visitors', location: 'Project Stalls' },
    { time: '02:00 PM - 04:00 PM', activity: 'Central Expert Jury Evaluation', location: 'Project Stalls' },
    { time: '04:30 PM - 05:30 PM', activity: 'Award Ceremony and Closing', location: 'Auditorium' }
  ];
  
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
                <div className="text-2xl font-bold text-blue-700">{stats.totalProjects}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <div className="text-sm text-green-500">Jury Members</div>
                <div className="text-2xl font-bold text-green-700">{stats.totalJuries}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <div className="text-sm text-purple-500">Evaluations Completed</div>
                <div className="text-2xl font-bold text-purple-700">{stats.completedEvaluations}</div>
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
                <div className="text-2xl font-bold text-yellow-700">{stats.pendingEvaluations}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <div className="text-sm text-red-500">Registrations Today</div>
                <div className="text-2xl font-bold text-red-700">{stats.registrationsToday}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-lg mr-4">
                <Map className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Departments</div>
                <div className="text-2xl font-bold text-gray-700">{stats.totalDepartments}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Projects by Department */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Projects by Department</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          {departmentProjects.map((dept, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{dept.department}</span>
                <span className="text-sm text-gray-500">{dept.evaluatedCount}/{dept.count} evaluated</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${(dept.count / stats.totalProjects) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Event Schedule */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Event Schedule - April 9, 2025</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventSchedule.map((item, index) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Registrations */}
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
          {projects.map((project, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">{project.id}</span>
                <h4 className="font-medium">{project.title}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <span className="mr-3">{project.department}</span>
                  <span className="flex items-center">
                    <User size={14} className="mr-1" />
                    {project.team} ({project.members})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Registered on {project.registrationDate}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                    Dept: {project.departmentEvaluation.status === 'completed' ? `${project.departmentEvaluation.score}%` : 'Pending'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Central: {project.centralEvaluation.status === 'completed' ? `${project.centralEvaluation.score}%` : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center">
            <Plus size={16} className="mr-1" />
            Add Project
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-700 mr-2">Filter By:</div>
        
        <select className="text-sm border border-gray-300 rounded-md p-2 bg-white">
          <option>All Departments</option>
          <option>Computer Engineering</option>
          <option>Electrical Engineering</option>
          <option>Civil Engineering</option>
        </select>
        
        <select className="text-sm border border-gray-300 rounded-md p-2 bg-white">
          <option>All Categories</option>
          <option>IoT & Smart Systems</option>
          <option>Software Development</option>
          <option>Hardware Project</option>
        </select>
        
        <select className="text-sm border border-gray-300 rounded-md p-2 bg-white">
          <option>All Evaluation Status</option>
          <option>Pending Department Evaluation</option>
          <option>Completed Department Evaluation</option>
          <option>Pending Central Evaluation</option>
          <option>Completed Central Evaluation</option>
        </select>
        
        <button className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center">
          <Download size={14} className="mr-1" />
          Export List
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
              {projects.map((project, index) => (
                <tr key={index}>
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
                    {project.team} ({project.members})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.departmentEvaluation.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Dept: {project.departmentEvaluation.status === 'completed' ? `${project.departmentEvaluation.score}%` : 'Pending'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.centralEvaluation.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Central: {project.centralEvaluation.status === 'completed' ? `${project.centralEvaluation.score}%` : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">42</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render the Jury Management tab content
  const renderJuryTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Jury Management</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center">
          <Plus size={16} className="mr-1" />
          Add Jury Member
        </button>
      </div>
      
      {/* Jury Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-500 mb-1">Department Jury Members</div>
          <div className="text-2xl font-bold text-blue-700">12</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-sm text-purple-500 mb-1">Central Expert Jury</div>
          <div className="text-2xl font-bold text-purple-700">4</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-sm text-green-500 mb-1">Evaluations Completed</div>
          <div className="text-2xl font-bold text-green-700">18/42</div>
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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Projects
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {juryMembers.map((jury) => (
                <tr key={jury.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jury.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {jury.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      jury.type === 'central' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {jury.type === 'central' ? 'Central Expert' : 'Department'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {jury.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{jury.evaluatedProjects}/{jury.assignedProjects}</span>
                      <div className="ml-2 w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600" 
                          style={{ width: `${(jury.evaluatedProjects / jury.assignedProjects) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Assign Projects
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
        // Import the locations tab component
        return <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium mb-4">Location Assignment Module</h3>
          <p className="text-gray-600 mb-2">This tab would contain the stall assignment interface where you can:</p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>View all stalls arranged by section</li>
            <li>Assign projects to available stalls</li>
            <li>See which stalls are already assigned</li>
            <li>Manage unassigned projects</li>
          </ul>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Load Location Assignment Module
          </button>
        </div>;
      case 'schedule':
        // Import the schedule tab component
        return <div className="bg-white p-4 rounded">
          <h3 className="text-lg font-medium mb-4">Schedule Management Module</h3>
          <p className="text-gray-600 mb-2">This tab would contain the schedule management interface where you can:</p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>View and edit the event timeline</li>
            <li>Manage activity schedules and locations</li>
            <li>Assign coordinators to activities</li>
            <li>Send schedule notifications to participants</li>
          </ul>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Load Schedule Management Module
          </button>
        </div>;
      default:
        return <div>Invalid tab</div>;
    }
  };

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('jury')}
          className={`px-4 py-2 rounded ${activeTab === 'jury' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Jury
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded ${activeTab === 'locations' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Locations
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Schedule
        </button>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default ProjectFairAdmin;