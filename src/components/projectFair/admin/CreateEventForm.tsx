import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { createEvent } from '../../../services/projectApi';
import { ProjectEvent } from '../../../types/project.types';
import axiosInstance from '../../../utils/axios';

interface Department {
  _id: string;
  name: string;
}

interface CreateEventFormProps {
  onEventCreated: (event: ProjectEvent) => void;
  onCancel: () => void;
}

type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface FormData {
  name: string;
  description: string;
  academicYear: string;
  eventDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  status: EventStatus;
  isActive: boolean;
  publishResults: boolean;
  departments: string[];
  schedule: any[];
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated, onCancel }) => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    academicYear: '',
    eventDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    status: 'upcoming',
    isActive: true,
    publishResults: false,
    departments: [],
    schedule: []
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<{ data: { departments: Department[] } }>('/departments');
        setDepartments(response.data.data.departments || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        showToast('Failed to load departments', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      const newEvent = await createEvent({
        ...formData,
        createdBy: 'current-user-id', // This should be replaced with the actual user ID
        updatedBy: 'current-user-id'  // This should be replaced with the actual user ID
      });
      console.log('Event created successfully:', newEvent);
      showToast('Event created successfully!', 'success');
      onEventCreated(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Failed to create event', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      departments: selectedOptions
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Project Fair Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
            Academic Year
          </label>
          <input
            type="text"
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            required
            placeholder="e.g., 2023-2024"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
            Event Date
          </label>
          <input
            type="datetime-local"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="registrationStartDate" className="block text-sm font-medium text-gray-700">
            Registration Start Date
          </label>
          <input
            type="datetime-local"
            id="registrationStartDate"
            name="registrationStartDate"
            value={formData.registrationStartDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="registrationEndDate" className="block text-sm font-medium text-gray-700">
            Registration End Date
          </label>
          <input
            type="datetime-local"
            id="registrationEndDate"
            name="registrationEndDate"
            value={formData.registrationEndDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active Event
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="publishResults"
            name="publishResults"
            checked={formData.publishResults}
            onChange={(e) => setFormData({ ...formData, publishResults: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="publishResults" className="ml-2 block text-sm text-gray-700">
            Publish Results
          </label>
        </div>

        <div>
          <label htmlFor="departments" className="block text-sm font-medium text-gray-700">
            Departments
          </label>
          <select
            id="departments"
            name="departments"
            multiple
            value={formData.departments}
            onChange={handleDepartmentChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            size={5}
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple departments</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;