import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Download, Upload, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Role } from '../../types/auth';

interface AdminRole {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

type SortField = 'name' | 'description' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Fetch roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:9000/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      // Initialize with some default roles if empty
      if (!data.data?.roles || data.data.roles.length === 0) {
        const defaultRoles = [
          {
            _id: '1',
            name: 'Admin',
            description: 'Full system access',
            permissions: ['create', 'read', 'update', 'delete'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'User',
            description: 'Basic user access',
            permissions: ['read'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setRoles(defaultRoles);
      } else {
        setRoles(data.data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('Error fetching roles', 'error');
      // Set some default roles for demo
      const defaultRoles = [
        {
          _id: '1',
          name: 'Admin',
          description: 'Full system access',
          permissions: ['create', 'read', 'update', 'delete'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'User',
          description: 'Basic user access',
          permissions: ['read'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setRoles(defaultRoles);
    } finally {
      setIsLoading(false);
    }
  };

  // Update role
  const handleUpdateRole = async (updatedRole: Partial<AdminRole>) => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`http://localhost:9000/api/admin/roles/${selectedRole._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedRole)
      });

      if (response.ok) {
        const { data } = await response.json();
        setRoles(roles.map(r => r._id === data.role._id ? data.role : r));
        setShowEditModal(false);
        setSelectedRole(null);
        showToast('Role updated successfully', 'success');
      } else {
        showToast('Failed to update role', 'error');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Error updating role', 'error');
    }
  };

  // Delete role
  const handleDelete = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await fetch(`http://localhost:9000/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRoles(roles.filter(role => role._id !== roleId));
      showToast('Role deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast(`Error deleting role: ${error}`, 'error');
    }
  };

  // Add role
  const handleAddRole = async (roleData: Partial<AdminRole>) => {
    try {
      const response = await fetch('http://localhost:9000/api/admin/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });

      if (!response.ok) {
        throw new Error('Failed to add role');
      }

      const { data } = await response.json();
      if (data && data.role) {
        setRoles([...roles, data.role]);
        setShowAddModal(false);
        showToast('Role added successfully', 'success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error adding role:', error);
      showToast(`Error adding role: ${error}`, 'error');
    }
  };

  // Import CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:9000/api/admin/roles/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        showToast('Roles imported successfully', 'success');
        fetchRoles();
      } else {
        const error = await response.text();
        showToast(`Import failed: ${error}`, 'error');
      }
    } catch (error) {
      showToast(`Error importing roles: ${error}`, 'error');
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/admin/roles/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.text();
        showToast(`Export failed: ${error}`, 'error');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roles.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Roles exported successfully', 'success');
    } catch (error) {
      showToast(`Error exporting roles: ${error}`, 'error');
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

  // Filter and sort roles
  const filteredAndSortedRoles = roles
    .filter(role => 
      (role.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (role.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return aValue > bValue ? modifier : -modifier;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <div className="flex gap-2">
          <label className="btn btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            className="btn btn-primary flex items-center"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Role
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search roles..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'name' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center">
                  Description
                  {sortField === 'description' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created At
                  {sortField === 'createdAt' && (
                    sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center">Loading...</td>
              </tr>
            ) : filteredAndSortedRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">No roles found</td>
              </tr>
            ) : (
              filteredAndSortedRoles.map((role) => (
                <tr key={role._id}>
                  <td className="px-4 py-2">{role.name || 'N/A'}</td>
                  <td className="px-4 py-2">{role.description || 'No description'}</td>
                  <td className="px-4 py-2">
                    {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          setSelectedRole(role);
                          setShowEditModal(true);
                        }}
                        title="Edit role"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-error"
                        onClick={() => handleDelete(role._id)}
                        title="Delete role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSave={handleUpdateRole}
        />
      )}

      {showAddModal && (
        <AddRoleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRole}
        />
      )}
    </div>
  );
};

interface EditRoleModalProps {
  role: AdminRole;
  onClose: () => void;
  onSave: (role: Partial<AdminRole>) => void;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    permissions: role.permissions
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Permissions</label>
            <select
              multiple
              className="select select-bordered w-full"
              value={formData.permissions}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, permissions: options });
              }}
            >
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddRoleModalProps {
  onClose: () => void;
  onSave: (role: Partial<AdminRole>) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Role</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Permissions</label>
            <select
              multiple
              className="select select-bordered w-full"
              value={formData.permissions}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, permissions: options });
              }}
            >
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Roles;
