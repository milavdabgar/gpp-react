import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import projectService from '../../../services/projectApi';
import { useToast } from '../../../context/ToastContext';

interface ProjectFormProps {
  onClose: () => void;
  onProjectCreated: () => void;
  eventId: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onProjectCreated, eventId }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    abstract: '',
    department: '',
    requirements: {
      power: false,
      internet: false,
      specialSpace: false,
      otherRequirements: ''
    },
    guide: {
      userId: '',
      name: '',
      department: '',
      contactNumber: ''
    },
    teamId: '',
    eventId: eventId
  });

  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [teams, setTeams] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchTeams();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await projectService.getDepartments();
      setDepartments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      if (!eventId) return;
      const teamsData = await projectService.getTeamsByEvent(eventId);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      showToast('Failed to load teams', 'error');
      setTeams([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await projectService.createProject(formData);
      showToast('Project created successfully', 'success');
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Project Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Category</option>
              <option value="Software Development">Software Development</option>
              <option value="Hardware Project">Hardware Project</option>
              <option value="IoT & Smart Systems">IoT & Smart Systems</option>
              <option value="Sustainable Technology">Sustainable Technology</option>
              <option value="Industry Problem Solution">Industry Problem Solution</option>
              <option value="Research & Innovation">Research & Innovation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team
            </label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Team</option>
              {Array.isArray(teams) && teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Abstract
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Project Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Project Requirements</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="power"
                  checked={formData.requirements.power}
                  onChange={handleRequirementsChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Requires Power Supply</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="internet"
                  checked={formData.requirements.internet}
                  onChange={handleRequirementsChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Requires Internet Connection</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="specialSpace"
                  checked={formData.requirements.specialSpace}
                  onChange={handleRequirementsChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Requires Special Space</label>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Other Requirements</label>
                <input
                  type="text"
                  name="otherRequirements"
                  value={formData.requirements.otherRequirements}
                  onChange={handleRequirementsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;