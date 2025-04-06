import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Settings, FileText, GraduationCap } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const menuItems = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <Users className="w-6 h-6" />,
      link: '/admin/users'
    },
    {
      title: 'Faculty Management',
      description: 'Manage faculty members and their details',
      icon: <GraduationCap className="w-6 h-6" />,
      link: '/admin/faculties'
    },
    {
      title: 'Project Fair',
      description: 'Manage project submissions and evaluations',
      icon: <Award className="w-6 h-6" />,
      link: '/project-fair'
    },
    {
      title: 'Reports',
      description: 'View and generate reports',
      icon: <FileText className="w-6 h-6" />,
      link: '/admin/reports'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: <Settings className="w-6 h-6" />,
      link: '/admin/settings'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
