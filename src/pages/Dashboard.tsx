import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

const DashboardContent: Record<Role, React.FC> = {
  student: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Student Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Project Fair"
          description="View and register your projects for the NPNI Project Fair"
          link="/project-fair"
        />
        <DashboardCard
          title="My Attendance"
          description="View your attendance records"
          link="#"
        />
        <DashboardCard
          title="Course Materials"
          description="Access study materials and resources"
          link="#"
        />
      </div>
    </div>
  ),
  faculty: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Faculty Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Project Evaluation"
          description="Evaluate student projects and provide feedback"
          link="/project-fair"
        />
        <DashboardCard
          title="Attendance Management"
          description="Manage student attendance"
          link="#"
        />
        <DashboardCard
          title="Course Management"
          description="Manage course materials and assignments"
          link="#"
        />
      </div>
    </div>
  ),
  hod: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">HOD Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Department Overview"
          description="View department statistics and reports"
          link="#"
        />
        <DashboardCard
          title="Faculty Management"
          description="Manage faculty assignments and workload"
          link="#"
        />
        <DashboardCard
          title="Course Planning"
          description="Plan and oversee course delivery"
          link="#"
        />
      </div>
    </div>
  ),
  principal: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Principal Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Institute Overview"
          description="View institute-wide statistics and reports"
          link="#"
        />
        <DashboardCard
          title="Department Management"
          description="Oversee department operations"
          link="#"
        />
        <DashboardCard
          title="Academic Planning"
          description="Strategic academic planning and oversight"
          link="#"
        />
      </div>
    </div>
  ),
  admin: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="User Management"
          description="Manage user accounts and permissions"
          link="#"
        />
        <DashboardCard
          title="System Settings"
          description="Configure system parameters"
          link="#"
        />
        <DashboardCard
          title="Project Fair Admin"
          description="Manage NPNI Project Fair settings"
          link="/project-fair"
        />
      </div>
    </div>
  ),
  jury: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Jury Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Project Evaluation"
          description="Evaluate projects and submit scores"
          link="/project-fair"
        />
        <DashboardCard
          title="Evaluation History"
          description="View your previous evaluations"
          link="#"
        />
      </div>
    </div>
  )
};

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, link }) => (
  <a
    href={link}
    className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </a>
);

const Dashboard: React.FC = () => {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  const handleRoleSwitch = (event: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(event.target.value as Role);
  };

  const Content = DashboardContent[user.selectedRole as Role] || DashboardContent.student;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">{user.department}</p>
        </div>
        
        {user.roles.length > 1 && (
          <div className="flex items-center space-x-2">
            <label htmlFor="role-select" className="text-sm font-medium text-gray-700">
              Switch Role:
            </label>
            <select
              id="role-select"
              value={user.selectedRole}
              onChange={handleRoleSwitch}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {user.roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Content />
    </div>
  );
};

export default Dashboard;
