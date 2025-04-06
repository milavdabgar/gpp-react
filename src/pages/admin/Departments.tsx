import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Department } from '../../types/department';

type SortField = 'name' | 'code' | 'establishedDate';
type SortOrder = 'asc' | 'desc';

interface EditDepartmentModalProps {
  department: Department;
  onClose: () => void;
  onSave: (department: Partial<Department>) => void;
}

interface AddDepartmentModalProps {
  onClose: () => void;
  onSave: (department: Partial<Department>) => void;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  // Fetch departments
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:9000/api/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const { status, data } = await response.json();
      if (status === 'success' && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Error fetching departments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle department updates
  const handleUpdateDepartment = async (updatedDepartment: Partial<Department>) => {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`http://localhost:9000/api/departments/${selectedDepartment._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedDepartment)
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }

      const { status, data } = await response.json();
      if (status === 'success' && data.department) {
        setDepartments(departments.map(d => 
          d._id === data.department._id ? data.department : d
        ));
        setShowEditModal(false);
        setSelectedDepartment(null);
        showToast('Department updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      showToast('Error updating department', 'error');
    }
  };

  // Handle department deletion
  const handleDelete = async (departmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`http://localhost:9000/api/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      setDepartments(departments.filter(d => d._id !== departmentId));
      showToast('Department deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting department:', error);
      showToast('Error deleting department', 'error');
    }
  };

  // Handle department creation
  const handleCreateDepartment = async (newDepartment: Partial<Department>) => {
    // Convert string date to ISO format
    const departmentData = {
      ...newDepartment,
      establishedDate: new Date(newDepartment.establishedDate!).toISOString()
    };
    try {
      console.log('Creating department:', departmentData);
      const response = await fetch('http://localhost:9000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(departmentData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to create department');
      }

      const { status, data } = await response.json();
      if (status === 'success' && data.department) {
        setDepartments([...departments, data.department]);
        setShowAddModal(false);
        showToast('Department created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      showToast('Error creating department', 'error');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter and sort departments
  const filteredAndSortedDepartments = departments
    .filter(department => {
      const searchLower = searchTerm.toLowerCase();
      return (
        department.name.toLowerCase().includes(searchLower) ||
        department.code.toLowerCase().includes(searchLower) ||
        department.description.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      return aValue < bValue ? -1 * modifier : aValue > bValue ? 1 * modifier : 0;
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Department
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Departments table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('code')}
              >
                Code
                {sortField === 'code' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name
                {sortField === 'name' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HOD
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredAndSortedDepartments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  No departments found
                </td>
              </tr>
            ) : (
              filteredAndSortedDepartments.map((department) => (
                <tr key={department._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{department.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department.name}</td>
                  <td className="px-6 py-4">{department.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {department.hodId ? (
                      <span className="text-sm">
                        {typeof department.hodId === 'string' ? 'Loading...' : department.hodId.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedDepartment(department);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(department._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedDepartment && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDepartment(null);
          }}
          onSave={handleUpdateDepartment}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddDepartmentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateDepartment}
        />
      )}
    </div>
  );
};

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ department, onClose, onSave }) => {
  const [users, setUsers] = useState<Array<{ _id: string; name: string; roles: string[] }>>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/admin/users?role=hod', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const { data } = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    name: department.name,
    code: department.code,
    description: department.description,
    hodId: typeof department.hodId === 'string' ? department.hodId : department.hodId?._id || '',
    establishedDate: department.establishedDate.split('T')[0],
    isActive: department.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Department</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">HOD</label>
            <select
              value={formData.hodId}
              onChange={(e) => setFormData({ ...formData, hodId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select HOD</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Established Date</label>
            <input
              type="date"
              value={formData.establishedDate}
              onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({ onClose, onSave }) => {
  const [users, setUsers] = useState<Array<{ _id: string; name: string; roles: string[] }>>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/admin/users?role=hod', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const { data } = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hodId: '',
    establishedDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Department</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">HOD</label>
            <select
              value={formData.hodId}
              onChange={(e) => setFormData({ ...formData, hodId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select HOD</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Established Date</label>
            <input
              type="date"
              value={formData.establishedDate}
              onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Departments;
