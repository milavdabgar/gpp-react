import React, { useEffect, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, Download, Upload, Edit, Trash2, Search, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types/auth';
import { Department } from '../../types/department';
import api from '../../services/api';
import { userApi } from '../../services/userApi';

interface AdminUser {
  // MongoDB document ID
  _id: string;
  name: string;
  email: string;
  department?: string; // This will store the department ID
  roles: Role[];
  selectedRole: Role;
}

type SortField = 'name' | 'email' | 'department';
type SortOrder = 'asc' | 'desc';

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 100;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user: currentUser } = useAuth() as { user: AdminUser | null };
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getAllUsers(
        currentPage,
        usersPerPage,
        searchTerm,
        selectedRole !== 'all' ? selectedRole : undefined,
        selectedDepartment !== 'all' ? selectedDepartment : undefined,
        sortField,
        sortOrder
      );
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Error fetching users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, usersPerPage, searchTerm, selectedRole, sortField, sortOrder, showToast]);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data } = await api.get<{ status: string; data: { departments: Department[] } }>('/departments');
      if (data.status === 'success' && Array.isArray(data.data.departments)) {
        setDepartments(data.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Error fetching departments', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, [fetchDepartments, fetchUsers]);

  // Delete user
  const handleUpdateUser = async (updatedUser: Partial<AdminUser>) => {
    if (!selectedUser) return;

    try {
      await userApi.updateUser(selectedUser._id, updatedUser);
      await fetchUsers(); // Refresh the list after update
      setShowEditModal(false);
      setSelectedUser(null);
      showToast('User updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Error updating user', 'error');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.deleteUser(userId);
      await fetchUsers(); // Refresh the list after deletion
      showToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(`Error deleting user: ${error}`, 'error');
    }
  };

  const handleAddUser = async (userData: Partial<AdminUser>) => {
    try {
      await userApi.createUser(userData);
      await fetchUsers(); // Refresh the list after adding
      setShowAddModal(false);
      showToast('User added successfully', 'success');
    } catch (error) {
      console.error('Error adding user:', error);
      showToast(`Error adding user: ${error}`, 'error');
    }
  };

  // Import CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await userApi.importUsers(formData);
      showToast('Users imported successfully', 'success');
      await fetchUsers(); // Refresh users list after import
    } catch (error) {
      showToast(`Error importing users: ${error}`, 'error');
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const blob = await userApi.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Users exported successfully', 'success');
    } catch (error) {
      showToast(`Error exporting users: ${error}`, 'error');
    }
  };

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get unique roles
  const departmentOptions = ['all', ...departments.map(dept => dept._id)];
  const roles = ['all', ...Array.from(new Set(users.flatMap(user => user.roles))).sort()];

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search changes
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle role filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchUsers();
  }, [selectedRole, selectedDepartment]);

  // Handle sort changes
  useEffect(() => {
    fetchUsers();
  }, [sortField, sortOrder]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            Add User
          </button>
          {/* Import/Export buttons */}
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleImport}
            />
          </label>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departmentOptions.map(deptId => (
              <option key={deptId} value={deptId}>
                {deptId === 'all' ? 'All Departments' : departments.find(d => d._id === deptId)?.name || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4">
          <div className="text-gray-600">
            {isLoading ? (
              <div className="flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Loading users...
              </div>
            ) : (
              `Showing ${users.length} of ${totalUsers} users`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortField === 'name' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  Email
                  {sortField === 'email' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-1">
                  Department
                  {sortField === 'department' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: AdminUser) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.department ? (departments.find(d => d._id === user.department)?.name || 'Unknown') : '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${role === user.selectedRole ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {user._id !== currentUser?._id && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
        />
      )}

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
};

interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (user: Partial<AdminUser>) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department || '',
    roles: user.roles
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    // Fetch departments
    fetch('http://localhost:9000/api/departments', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setDepartments(data.data.departments);
        }
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });

    // Fetch available roles
    fetch('http://localhost:9000/api/admin/roles', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.data.roles)) {
          // Extract just the role names
          const roleNames = data.data.roles.map((role: { name: string }) => role.name as Role);
          setAvailableRoles(roleNames);
        }
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
        setAvailableRoles([]);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roles</label>
              <div className="mt-2 space-y-2">
                {availableRoles.map((role) => (
                  <label key={role} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...formData.roles, role]
                          : formData.roles.filter(r => r !== role);
                        setFormData({ ...formData, roles: newRoles });
                      }}
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: Partial<AdminUser>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    department: '',
    roles: ['admin'],
    selectedRole: 'admin'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="selectedRole"
                value={formData.selectedRole}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
                <option value="principal">Principal</option>
                <option value="admin">Admin</option>
                <option value="jury">Jury</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;
