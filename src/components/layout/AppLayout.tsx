import React, { useState } from 'react';
import { Menu, X, User, Bell, LogOut, ChevronDown, Home, Book, Calendar, Users, Award, Layers, Activity, Settings } from 'lucide-react';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [currentModule, setCurrentModule] = useState('dashboard');
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Role-specific navigation items
  const navigationItems = {
    student: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'Courses', icon: Book, id: 'courses' },
      { name: 'Timetable', icon: Calendar, id: 'timetable' },
      { name: 'Attendance', icon: Activity, id: 'attendance' },
      { name: 'Project Fair', icon: Award, id: 'project-fair', highlight: true },
    ],
    faculty: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'My Courses', icon: Book, id: 'courses' },
      { name: 'Timetable', icon: Calendar, id: 'timetable' },
      { name: 'Student Management', icon: Users, id: 'students' },
      { name: 'Project Fair Jury', icon: Award, id: 'project-jury', highlight: true },
    ],
    admin: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'User Management', icon: Users, id: 'users' },
      { name: 'Departments', icon: Layers, id: 'departments' },
      { name: 'Project Fair Admin', icon: Award, id: 'project-admin', highlight: true },
      { name: 'Settings', icon: Settings, id: 'settings' },
    ]
  };
  
  // Sample user data
  const userData = {
    name: 'Raj Patel',
    role: activeRole,
    avatar: null,
    department: 'Computer Engineering'
  };
  
  // Handle navigation click
  const handleNavClick = (id: string) => {
    setCurrentModule(id);
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  // Switch between roles (for demo purposes)
  const switchRole = (role: 'student' | 'faculty' | 'admin') => {
    setActiveRole(role);
    setCurrentModule('dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-800 font-bold">GP</div>
            <div className="font-bold text-lg">GP Palanpur</div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* User profile summary */}
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="w-10 h-10 rounded-full" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <div className="font-medium">{userData.name}</div>
              <div className="text-xs text-blue-300 capitalize">{userData.role}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems[activeRole].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    currentModule === item.id
                      ? 'bg-blue-700 text-white'
                      : item.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Role switcher (demo only) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <div className="text-xs text-blue-300 mb-2">Role Switcher (Demo)</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => switchRole('student')}
              className={`px-2 py-1 rounded text-xs ${activeRole === 'student' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Student
            </button>
            <button 
              onClick={() => switchRole('faculty')}
              className={`px-2 py-1 rounded text-xs ${activeRole === 'faculty' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Faculty
            </button>
            <button 
              onClick={() => switchRole('admin')}
              className={`px-2 py-1 rounded text-xs ${activeRole === 'admin' ? 'bg-white text-blue-800' : 'bg-blue-700 text-white'}`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 focus:outline-none lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">
                {navigationItems[activeRole].find(item => item.id === currentModule)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 focus:outline-none relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="relative">
                <button className="flex items-center space-x-1 focus:outline-none">
                  <span className="text-sm font-medium text-gray-700 hidden md:block">Account</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {currentModule === 'project-fair' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">New Palanpur for New India - Project Fair</h2>
              <p className="mb-4">Register your project for the upcoming fair on April 9th, 2025.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Register Your Project
              </button>
            </div>
          )}
          
          {currentModule === 'project-jury' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Project Fair - Jury Panel</h2>
              <p className="mb-4">You have been assigned as jury for the Computer Engineering department.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Start Evaluation
              </button>
            </div>
          )}
          
          {currentModule === 'project-admin' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Project Fair Administration</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="text-2xl font-bold">42</div>
                  <div className="text-sm text-gray-600">Registered Projects</div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="text-2xl font-bold">16</div>
                  <div className="text-sm text-gray-600">Jury Members</div>
                </div>
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-gray-600">Departments</div>
                </div>
              </div>
              <div className="space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Manage Projects
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                  Jury Assignment
                </button>
              </div>
            </div>
          )}
          
          {currentModule === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">Quick Access</div>
                  <div className="text-lg font-semibold">Project Fair Registration</div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      Deadline: Apr 8
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">Upcoming</div>
                  <div className="text-lg font-semibold">New Palanpur for New India</div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Apr 9, 2025
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <div className="text-sm font-medium text-gray-500 mb-1">Notifications</div>
                  <div className="text-lg font-semibold">3 New Messages</div>
                  <div className="mt-2 text-blue-600 text-sm">View all</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium">Recent Activity</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Activity size={16} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Project Fair registration started</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Book size={16} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">New study material uploaded</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Calendar size={16} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Timetable updated for next week</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
