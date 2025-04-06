import React, { useState } from 'react';
import { Menu, X, User, Bell, LogOut, ChevronDown, Home, Book, Calendar, Users, Award, Layers, Activity, Settings, FileText, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import { Role } from '../../types/auth';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Role-specific navigation items
  const navigationItems: Record<Role, Array<{
    name: string;
    icon: React.FC<{ size?: number }>;
    id: string;
    highlight?: boolean;
  }>> = {
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
      { name: 'Role Management', icon: Users, id: 'roles' },
      { name: 'Departments', icon: Layers, id: 'departments' },
      { name: 'Faculty', icon: Users, id: 'faculties' },
      { name: 'Students', icon: Users, id: 'students' },
      { name: 'Results', icon: BarChart, id: 'results' }, // New item for Results
      { name: 'Project Fair Admin', icon: Award, id: 'project-fair', highlight: true },
      { name: 'Settings', icon: Settings, id: 'settings' },
    ],
    hod: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'Department', icon: Layers, id: 'department' },
      { name: 'Faculty', icon: Users, id: 'faculty' },
      { name: 'Results', icon: BarChart, id: 'results' }, // New item for Results
      { name: 'Projects', icon: Award, id: 'projects' },
    ],
    principal: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'Departments', icon: Layers, id: 'departments' },
      { name: 'Faculty', icon: Users, id: 'faculty' },
      { name: 'Results', icon: BarChart, id: 'results' }, // New item for Results
      { name: 'Projects', icon: Award, id: 'projects' },
    ],
    jury: [
      { name: 'Dashboard', icon: Home, id: 'dashboard' },
      { name: 'Project Evaluation', icon: Award, id: 'evaluation' },
    ]
  };
  
  // Get current user role
  const userRole = (user?.selectedRole || 'student') as Role;
  
  // Handle navigation click
  const handleNavClick = (id: string) => {
    setCurrentModule(id);
    // Navigate to the appropriate route
    if (userRole === 'admin') {
      if (id === 'users') {
        navigate('/admin/users');
      } else if (id === 'dashboard') {
        navigate('/admin');
      } else if (id === 'project-fair') {
        navigate('/project-fair');
      } else if (id === 'results') {
        navigate('/admin/results');
      } else {
        navigate(`/admin/${id}`);
      }
    } else {
      navigate(`/${id}`);
    }
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
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
              <User size={20} />
            </div>
            <div>
              <div className="font-medium">{user?.name || 'User'}</div>
              <div className="text-xs text-blue-300 capitalize">{user?.selectedRole || 'student'}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems[userRole].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-colors ${
                    currentModule === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  {item.highlight && (
                    <span className="ml-auto inline-block w-2 h-2 bg-yellow-400 rounded-full" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span>{user?.name || 'Account'}</span>
                  <ChevronDown size={16} />
                </button>
                
                {/* Account dropdown menu */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50">
                    {/* Role switcher */}
                    {user?.roles && user.roles.length > 1 && (
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-2">Switch Role</div>
                        <div className="space-y-1">
                          {user.roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => {
                                switchRole(role);
                                setShowAccountMenu(false);
                              }}
                              className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${user.selectedRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              <span className="capitalize">{role}</span>
                              {user.selectedRole === role && (
                                <span className="ml-auto text-blue-700">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Logout button */}
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;