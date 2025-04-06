import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to GP Palanpur Portal</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          <p>Department: {user.department}</p>
          <p>Role: {role}</p>
        </div>
      ) : (
        <p>Please log in to access the portal features.</p>
      )}
    </div>
  );
};

export default Dashboard;
