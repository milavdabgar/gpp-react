import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types/auth';
import { useAuth } from '../context/AuthContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { error, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    selectedRole: 'student' as Role
  });

  // Mock available roles - in real app, this would come from an API
  const availableRoles: Role[] = ['student', 'faculty'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:9000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Redirect to login page after successful signup
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' }
        });
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error handling will be done by the AuthContext
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (minimum 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="selectedRole" className="sr-only">Select Role</label>
              <select
                id="selectedRole"
                name="selectedRole"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.selectedRole}
                onChange={handleChange}
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
            <div className="text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
