import React, { useState, useEffect, FormEvent } from 'react';
import { ChevronUp, ChevronDown, Download, Upload, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { facultyApi } from '../../services/api';

type SortField = 'employeeId' | 'designation' | 'department' | 'joiningDate';
type SortOrder = 'asc' | 'desc';

interface User {
  _id: string;
  name: string;
  email: string;
  roles?: string[];
  department?: string;
}

interface Department {
  _id: string;
  name: string;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  roles?: string[];
}

interface DepartmentType {
  _id: string;
  name: string;
}

interface Qualification {
  degree: string;
  field: string;
  institution: string;
  year: number;
}

interface CreateFacultyDto {
  userId: string;
  departmentId: string;
  employeeId: string;
  designation: string;
  specializations?: string[];
  qualifications?: Qualification[];
  joiningDate: string;
  status: string;
  experience?: {
    years: number;
    details: string;
  };
}

interface FacultyWithDetails {
  _id?: string;
  userId: string;
  departmentId: string;
  employeeId: string;
  designation: string;
  specializations?: string[];
  qualifications?: Qualification[];
  joiningDate: string;
  status: string;
  experience?: {
    years: number;
    details: string;
  };
  user?: UserType;
  department?: DepartmentType;
}

const Faculty = () => {
  const { showToast } = useToast();
  const [faculty, setFaculty] = useState<FacultyWithDetails[]>([]);
  
  const transformQualifications = (quals: any[]): Qualification[] => {
    if (!quals) return [];
    if (typeof quals[0] === 'string') {
      return quals.map(q => ({
        degree: q,
        field: '',
        institution: '',
        year: new Date().getFullYear()
      }));
    }
    return quals;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithDetails | null>(null);

  const designationOptions = [
    'Lecturer',
    'Senior Lecturer',
    'Selection Grade Lecturer',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'HOD',
    'Principal',
    'Dean'
  ];

  const qualificationOptions = [
    'Ph.D',
    'M.Tech',
    'B.Tech',
    'MCA',
    'BCA',
    'M.Sc',
    'B.Sc',
    'MBA'
  ];

  const specializationOptions = [
    'General',
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Web Development',
    'Database Systems',
    'Computer Networks',
    'Cybersecurity'
  ];
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('employeeId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const { user: currentUser } = useAuth();

  // Fetch faculty members
  useEffect(() => {
    fetchUsers();
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setIsLoading(true);
    try {
      const facultyResponse = await facultyApi.getAllFaculty();
      const facultyWithDetails = facultyResponse.data.faculty.map((f: any) => ({
        ...f,
        user: typeof f.userId === 'object' ? f.userId : null,
        department: typeof f.departmentId === 'object' ? f.departmentId : null,
        // Ensure we always have string IDs
        userId: typeof f.userId === 'object' ? f.userId._id : f.userId,
        departmentId: typeof f.departmentId === 'object' ? f.departmentId._id : f.departmentId
      }));
      setFaculty(facultyWithDetails.map((f: any) => ({
        ...f,
        qualifications: transformQualifications(f.qualifications)
      })));
    } catch (error) {
      console.error('Error fetching faculty:', error);
      showToast('Error fetching faculty data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch departments first to ensure we have valid department IDs
      await fetchDepartments();
      
      const response = await api.get<{ status: string; data: { users: User[] } }>('/admin/users');
      const facultyUsers = response.data.data.users.filter(user => user.roles?.includes('faculty'));
      setUsers(facultyUsers);
      
      // Create faculty entries for users who don't have one
      const facultyResponse = await facultyApi.getAllFaculty();
      const existingFacultyUserIds = facultyResponse.data.faculty
        .filter(f => f.userId) // Filter out any invalid entries
        .map(f => f.userId._id);
      
      // Create faculty entries for users who don't have one and have a valid department
      const usersWithoutFaculty = facultyUsers.filter(user => 
        !existingFacultyUserIds.includes(user._id) && 
        user.department && 
        departments.some(d => d._id === user.department)
      ).filter(user => user.department !== undefined); // Extra type safety
      
      if (usersWithoutFaculty.length > 0) {
        showToast(`Creating faculty entries for ${usersWithoutFaculty.length} new faculty members...`, 'info');
        
        for (const user of usersWithoutFaculty) {
          try {
            // Double check to prevent race conditions
            const checkExisting = await facultyApi.getAllFaculty();
            if (checkExisting.data.faculty.some(f => f.userId?._id === user._id)) {
              console.log(`Faculty entry already exists for user ${user.name}, skipping...`);
              continue;
            }
            
            // Create faculty with user details and default password
            const newFaculty = {
              name: user.name,
              email: user.email,
              password: 'Faculty@123', // Default password for bulk upload
              employeeId: `F${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              designation: 'Assistant Professor',
              departmentId: user.department as string,
              joiningDate: new Date().toISOString().split('T')[0],
              status: 'active',
              specializations: ['General'],
              qualifications: [{
                degree: 'Ph.D.',
                field: 'General',
                institution: 'Institution Pending',
                year: new Date().getFullYear()
              }],
              experience: {
                years: 0,
                details: 'New faculty member'
              }
            };
            await facultyApi.createFaculty(newFaculty);
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Error creating faculty entry for user ${user.name}`;
            console.error(errorMessage, error);
            showToast(errorMessage, 'error');
          }
        }
        
        // Refresh faculty list after creating new entries
        fetchFacultyData();
        showToast('Faculty entries created successfully', 'success');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ status: string; data: { departments: Department[] } }>('/departments');
      setDepartments(response.data.data.departments);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setIsLoading(false);
      showToast('Failed to fetch departments', 'error');
    }
  };

  const handleEditClick = (faculty: FacultyWithDetails) => {
    // Ensure we have the complete faculty details before editing
    const completeDetails = {
      ...faculty,
      userId: faculty.user?._id || faculty.userId,
      departmentId: faculty.department?._id || faculty.departmentId,
      experience: faculty.experience || { years: 0, details: '' }
    };
    setSelectedFaculty(completeDetails);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await facultyApi.deleteFaculty(id);
        showToast('Faculty member deleted successfully', 'success');
        fetchFacultyData();
      } catch (error) {
        console.error('Error deleting faculty:', error);
        showToast('Error deleting faculty member', 'error');
      }
    }
  };

  // Sort faculty members
  const handleExportCsv = async () => {
    try {
      setIsLoading(true);
      const response = await facultyApi.exportFacultyCsv();
      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'faculty.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting faculty data:', error);
      showToast('Failed to export faculty data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const response = await facultyApi.uploadFacultyCsv(formData);
      showToast('Faculty data uploaded successfully', 'success');
      fetchFacultyData(); // Refresh the faculty list
    } catch (error) {
      console.error('Error uploading faculty data:', error);
      showToast('Failed to upload faculty data', 'error');
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedFaculty = faculty.sort((a, b) => {
    let compareA: string | number | Date = '';
    let compareB: string | number | Date = '';

    switch (sortField) {
      case 'employeeId':
        compareA = a.employeeId;
        compareB = b.employeeId;
        break;
      case 'designation':
        compareA = a.designation;
        compareB = b.designation;
        break;
      case 'department':
        compareA = a.department?.name || '';
        compareB = b.department?.name || '';
        break;
      case 'joiningDate':
        compareA = new Date(a.joiningDate);
        compareB = new Date(b.joiningDate);
        break;
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter faculty members
  const filteredFaculty = sortedFaculty.filter(f => {
    const matchesSearch = (
      f.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDepartment = selectedDepartment === 'all' || f.department?._id === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <label htmlFor="csvUpload" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </label>
          <input
            id="csvUpload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
          />
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Faculty
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('employeeId')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Employee ID
                {sortField === 'employeeId' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th
                onClick={() => handleSort('designation')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Designation
                {sortField === 'designation' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </th>
              <th
                onClick={() => handleSort('department')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Department
                {sortField === 'department' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </th>
              <th
                onClick={() => handleSort('joiningDate')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Joining Date
                {sortField === 'joiningDate' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredFaculty.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No faculty members found
                </td>
              </tr>
            ) : (
              filteredFaculty.map((faculty) => (
                <tr key={faculty._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.department?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(faculty.joiningDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${faculty.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {faculty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(faculty)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => faculty._id && handleDelete(faculty._id)}
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

      {/* Edit Faculty Modal */}
      {showEditModal && selectedFaculty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Faculty Member</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                &times;
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                if (!selectedFaculty._id) throw new Error('No faculty ID');

                const selectedSpecializations = Array.from(e.currentTarget.specializations.selectedOptions).map(option => (option as HTMLOptionElement).value);
                const selectedQualifications = Array.from(e.currentTarget.qualifications.selectedOptions).map(option => (option as HTMLOptionElement).value);

                // Create a map of existing qualifications for easy lookup
                const existingQualificationsMap = new Map(
                  selectedFaculty.qualifications?.map(q => [q.degree, q]) || []
                );

                const updatedFaculty = {
                  name: formData.get('name')?.toString() || '',
                  email: formData.get('email')?.toString() || '',
                  employeeId: formData.get('employeeId')?.toString() || '',
                  designation: formData.get('designation')?.toString() || '',
                  departmentId: formData.get('departmentId')?.toString() || '',
                  joiningDate: formData.get('joiningDate')?.toString() || '',
                  specializations: selectedSpecializations,
                  qualifications: selectedQualifications.map(degree => {
                    // If we have existing data for this degree, use it
                    const existing = existingQualificationsMap.get(degree);
                    if (existing) {
                      return existing;
                    }
                    // Otherwise create a new qualification with default values
                    return {
                      degree,
                      field: 'General',
                      institution: 'Institution',
                      year: new Date().getFullYear()
                    };
                  }),
                  status: formData.get('status')?.toString() || 'active',
                  experience: {
                    years: parseInt(formData.get('years')?.toString() || '0'),
                    details: formData.get('details')?.toString() || ''
                  }
                };

                await facultyApi.updateFaculty(selectedFaculty._id, updatedFaculty);
                showToast('Faculty member updated successfully', 'success');
                setShowEditModal(false);
                setSelectedFaculty(null);
                fetchFacultyData();
              } catch (error) {
                console.error('Error updating faculty:', error);
                showToast('Failed to update faculty member', 'error');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedFaculty.user?.name || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedFaculty.user?.email || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  name="departmentId"
                  defaultValue={selectedFaculty.departmentId}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  defaultValue={selectedFaculty.employeeId}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <select
                  name="designation"
                  defaultValue={selectedFaculty.designation}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  defaultValue={selectedFaculty.joiningDate.split('T')[0]}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={selectedFaculty.status}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specializations</label>
                <select
                  multiple
                  name="specializations"
                  defaultValue={selectedFaculty.specializations || []}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32"
                >
                  {specializationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <select
                  multiple
                  name="qualifications"
                  defaultValue={selectedFaculty.qualifications?.map(q => q.degree) || []}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32"
                >
                  {qualificationOptions.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Years</label>
                <input
                  type="number"
                  name="years"
                  defaultValue={selectedFaculty.experience?.years || 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Details</label>
                <textarea
                  name="details"
                  defaultValue={selectedFaculty.experience?.details || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Faculty Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                &times;
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="departmentId"
                    defaultValue={selectedFaculty?.department?._id || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    defaultValue={selectedFaculty?.employeeId}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <select
                  name="designation"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specializations</label>
                <select
                  multiple
                  name="specializations"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32"
                >
                  {specializationOptions.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                <select
                  multiple
                  name="qualifications"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32"
                >
                  {qualificationOptions.map(qual => (
                    <option key={qual} value={qual}>{qual}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  defaultValue={selectedFaculty?.joiningDate}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                <input
                  type="number"
                  name="years"
                  min="0"
                  defaultValue={selectedFaculty?.experience?.years}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Details</label>
                <textarea
                  name="details"
                  rows={3}
                  defaultValue={selectedFaculty?.experience?.details}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={selectedFaculty?.status}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
