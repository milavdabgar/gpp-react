import React, { useState, useEffect, FormEvent } from 'react';
import { ChevronUp, ChevronDown, Download, Upload, Edit, Trash2, Search, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api, { studentApi } from '../../services/api';

type SortField = 'enrollmentNo' | 'batch' | 'department' | 'admissionDate';
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

interface EducationBackground {
  degree: string;
  institution: string;
  board: string;
  percentage: number;
  yearOfPassing: number;
}

interface CreateStudentDto {
  userId: string;
  departmentId: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  status: string;
  guardian: {
    name: string;
    relation: string;
    contact: string;
    occupation: string;
  };
  contact: {
    mobile: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  educationBackground?: EducationBackground[];
}

interface StudentWithDetails {
  _id?: string;
  userId: string;
  departmentId: string;
  enrollmentNo: string;
  batch: string;
  semester: number;
  admissionDate: string;
  status: string;
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  guardian: {
    name: string;
    relation: string;
    contact: string;
    occupation: string;
  };
  contact: {
    mobile: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  educationBackground?: EducationBackground[];
  user?: UserType;
  department?: DepartmentType;
  admissionYear: number;
  convoyYear?: number;
  isComplete: boolean;
  termClose: boolean;
  isCancel: boolean;
  isPassAll: boolean;
}

interface GTUImportResponse {
    results: StudentWithDetails[];
    count: number;
    errors?: { row: number; error: string }[];
    warnings?: { row: number; warning: string }[];
  }

const Student = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  
  const transformEducationBackground = (eduBg: any[]): EducationBackground[] => {
    if (!eduBg) return [];
    return eduBg;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);

  const statusOptions = [
    'active',
    'inactive',
    'graduated',
    'transferred',
    'dropped'
  ];

  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  const batchOptions = [
    '2020-2023',
    '2021-2024',
    '2022-2025',
    '2023-2026',
    '2024-2027'
  ];

  const educationDegreeOptions = [
    'SSC (10th)',
    'HSC (12th)',
    'Diploma',
    'Bachelor',
    'Master'
  ];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('enrollmentNo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const { user: currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const studentsPerPage = 100;

  // Fetch students when page changes
  useEffect(() => {
    fetchStudentData();
  }, [currentPage]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const studentResponse = await studentApi.getAllStudents(currentPage, studentsPerPage);
      const studentsWithDetails = studentResponse.data.students.map((s: any) => ({
        ...s,
        // Properly handle the populated userId object
        user: (s.userId && typeof s.userId === 'object') ? s.userId : null,
        department: (s.departmentId && typeof s.departmentId === 'object') ? s.departmentId : null,
        userId: (s.userId && typeof s.userId === 'object') ? s.userId._id : s.userId,
        departmentId: (s.departmentId && typeof s.departmentId === 'object') ? s.departmentId._id : s.departmentId
      }));
      setStudents(studentsWithDetails.map((s: any) => ({
        ...s,
        educationBackground: transformEducationBackground(s.educationBackground)
      })));
      setTotalPages(studentResponse.data.pagination.totalPages);
      setTotalStudents(studentResponse.data.pagination.total);
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Error fetching student data', 'error');
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
      const studentUsers = response.data.data.users.filter(user => user.roles?.includes('student'));
      setUsers(studentUsers);
      
      // Create student entries for users who don't have one
      const studentResponse = await studentApi.getAllStudents();
      const existingStudentUserIds = studentResponse.data.students
        .filter((s: any) => s.userId) // Filter out any invalid entries
        .map((s: any) => s.userId._id);
      
      // Create student entries for users who don't have one and have a valid department
      const usersWithoutStudent = studentUsers.filter(user => 
        !existingStudentUserIds.includes(user._id) && 
        user.department && 
        departments.some(d => d._id === user.department)
      ).filter(user => user.department !== undefined); // Extra type safety
      
      if (usersWithoutStudent.length > 0) {
        showToast(`Creating student entries for ${usersWithoutStudent.length} new student users...`, 'info');
        
        for (const user of usersWithoutStudent) {
          try {
            // Double check to prevent race conditions
            const checkExisting = await studentApi.getAllStudents();
            if (checkExisting.data.students.some((s: any) => s.userId?._id === user._id)) {
              console.log(`Student entry already exists for user ${user.name}, skipping...`);
              continue;
            }
            
            // Create student with user details and default information
            const newStudent = {
              name: user.name,
              email: user.email,
              password: 'Student@123', // Default password for bulk upload
              enrollmentNo: `S${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              batch: batchOptions[0],
              semester: 1,
              departmentId: user.department as string,
              admissionYear: new Date().getFullYear(),
              status: 'active',
              guardian: {
                name: 'Guardian Name',
                relation: 'Parent',
                contact: '1234567890',
                occupation: 'Not Specified'
              },
              contact: {
                mobile: '1234567890',
                email: user.email,
                address: 'Address not specified',
                city: 'City',
                state: 'State',
                pincode: '000000'
              },
              educationBackground: [{
                degree: 'HSC (12th)',
                institution: 'Institution not specified',
                board: 'Board not specified',
                percentage: 70,
                yearOfPassing: new Date().getFullYear() - 1
              }]
            };
            await studentApi.createStudent(newStudent);
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || `Error creating student entry for user ${user.name}`;
            console.error(errorMessage, error);
            showToast(errorMessage, 'error');
          }
        }
        
        // Refresh student list after creating new entries
        fetchStudentData();
        showToast('Student entries created successfully', 'success');
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

  const handleEditClick = (student: StudentWithDetails) => {
    // Ensure we have the complete student details before editing
    const completeDetails = {
      ...student,
      userId: student.user?._id || student.userId,
      departmentId: student.department?._id || student.departmentId,
      guardian: student.guardian || {
        name: '',
        relation: '',
        contact: '',
        occupation: ''
      },
      contact: student.contact || {
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      }
    };
    setSelectedStudent(completeDetails);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentApi.deleteStudent(id);
        showToast('Student deleted successfully', 'success');
        fetchStudentData();
      } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Error deleting student', 'error');
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsLoading(true);
      const response = await studentApi.exportStudentsCsv();
      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting student data:', error);
      showToast('Failed to export student data', 'error');
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
      // Check if it's a GTU student data file
      const isGTUData = file.name.toLowerCase().includes('studentdata');
      
      if (isGTUData) {
        showToast('Importing GTU student data...', 'info');
        const response = await studentApi.uploadStudentsCsv(formData);
        if (response.warnings) {
          showToast(`Import completed with ${response.warnings.length} warnings`, 'warning');
        }
        showToast(`Successfully imported ${response.count} students`, 'success');
        // Refresh the data to show updated names
        await fetchStudentData();
        await fetchUsers();
      } else {
        const response = await studentApi.uploadStudentsCsv(formData);
        showToast(`Successfully imported ${response.count} students`, 'success');
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error uploading student data:', error);
      showToast('Failed to upload student data', 'error');
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

  const sortedStudents = students.sort((a, b) => {
    let compareA: string | number | Date = '';
    let compareB: string | number | Date = '';

    switch (sortField) {
      case 'enrollmentNo':
        compareA = a.enrollmentNo;
        compareB = b.enrollmentNo;
        break;
      case 'batch':
        compareA = a.batch;
        compareB = b.batch;
        break;
      case 'department':
        compareA = a.department?.name || '';
        compareB = b.department?.name || '';
        break;
      case 'admissionDate':
        compareA = new Date(a.admissionDate);
        compareB = new Date(b.admissionDate);
        break;
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter students
  const filteredStudents = sortedStudents.filter(s => {
    const matchesSearch = (
      s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDepartment = selectedDepartment === 'all' || s.department?._id === selectedDepartment;
    const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;

    return matchesSearch && matchesDepartment && matchesBatch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <label 
            htmlFor="csvUpload" 
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import GTU Data
              </>
            )}
          </label>
          <input
            id="csvUpload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCsv}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search students..."
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
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Batches</option>
          {batchOptions.map(batch => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
      </div>

      {/* Students table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => handleSort('enrollmentNo')} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Enrollment No
                {sortField === 'enrollmentNo' && (
                  sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admission Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Convoy Year
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
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.enrollmentNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user?.name || student.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.admissionYear || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.convoyYear || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStudentStatus(student)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => student._id && handleDelete(student._id)}
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

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, totalStudents)} of {totalStudents} students
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Edit Student</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                &times;
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                if (!selectedStudent._id) throw new Error('No student ID');

                const updatedStudent = {
                  name: formData.get('name')?.toString() || '',
                  email: formData.get('email')?.toString() || '',
                  enrollmentNo: formData.get('enrollmentNo')?.toString() || '',
                  batch: formData.get('batch')?.toString() || '',
                  semester: parseInt(formData.get('semester')?.toString() || '1'),
                  departmentId: formData.get('departmentId')?.toString() || '',
                  status: formData.get('status')?.toString() || 'active',
                  guardian: {
                    name: formData.get('guardianName')?.toString() || '',
                    relation: formData.get('guardianRelation')?.toString() || '',
                    contact: formData.get('guardianContact')?.toString() || '',
                    occupation: formData.get('guardianOccupation')?.toString() || ''
                  },
                  contact: {
                    mobile: formData.get('mobile')?.toString() || '',
                    email: formData.get('contactEmail')?.toString() || '',
                    address: formData.get('address')?.toString() || '',
                    city: formData.get('city')?.toString() || '',
                    state: formData.get('state')?.toString() || '',
                    pincode: formData.get('pincode')?.toString() || ''
                  }
                };

                await studentApi.updateStudent(selectedStudent._id, updatedStudent);
                showToast('Student updated successfully', 'success');
                setShowEditModal(false);
                setSelectedStudent(null);
                fetchStudentData();
              } catch (error) {
                console.error('Error updating student:', error);
                showToast('Failed to update student', 'error');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedStudent.user?.name || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedStudent.user?.email || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  name="departmentId"
                  defaultValue={selectedStudent.departmentId}
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
                <label className="block text-sm font-medium text-gray-700">Enrollment Number</label>
                <input
                  type="text"
                  name="enrollmentNo"
                  defaultValue={selectedStudent.enrollmentNo}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch</label>
                  <select
                    name="batch"
                    defaultValue={selectedStudent.batch}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Batch</option>
                    {batchOptions.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    name="semester"
                    defaultValue={selectedStudent.semester}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={selectedStudent.status}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <h4 className="text-md font-medium mt-4">Guardian Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    defaultValue={selectedStudent.guardian?.name || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation</label>
                  <input type="text"
                    name="guardianRelation"
                    defaultValue={selectedStudent.guardian?.relation || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    name="guardianContact"
                    defaultValue={selectedStudent.guardian?.contact || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    name="guardianOccupation"
                    defaultValue={selectedStudent.guardian?.occupation || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h4 className="text-md font-medium mt-4">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    defaultValue={selectedStudent.contact?.mobile || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    defaultValue={selectedStudent.contact?.email || ''}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  defaultValue={selectedStudent.contact?.address || ''}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={selectedStudent.contact?.city || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={selectedStudent.contact?.state || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    defaultValue={selectedStudent.contact?.pincode || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                &times;
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                const newStudent = {
                  name: formData.get('name')?.toString() || '',
                  email: formData.get('email')?.toString() || '',
                  password: formData.get('password')?.toString() || '',
                  enrollmentNo: formData.get('enrollmentNo')?.toString() || '',
                  batch: formData.get('batch')?.toString() || '',
                  semester: parseInt(formData.get('semester')?.toString() || '1'),
                  departmentId: formData.get('departmentId')?.toString() || '',
                  admissionYear: parseInt((formData.get('enrollmentNo')?.toString() || '').substring(0, 4)),
                  status: formData.get('status')?.toString() || 'active',
                  guardian: {
                    name: formData.get('guardianName')?.toString() || '',
                    relation: formData.get('guardianRelation')?.toString() || '',
                    contact: formData.get('guardianContact')?.toString() || '',
                    occupation: formData.get('guardianOccupation')?.toString() || ''
                  },
                  contact: {
                    mobile: formData.get('mobile')?.toString() || '',
                    email: formData.get('contactEmail')?.toString() || '',
                    address: formData.get('address')?.toString() || '',
                    city: formData.get('city')?.toString() || '',
                    state: formData.get('state')?.toString() || '',
                    pincode: formData.get('pincode')?.toString() || ''
                  },
                  educationBackground: [{
                    degree: 'HSC (12th)',
                    institution: formData.get('institution')?.toString() || '',
                    board: formData.get('board')?.toString() || '',
                    percentage: parseFloat(formData.get('percentage')?.toString() || '0'),
                    yearOfPassing: parseInt(formData.get('yearOfPassing')?.toString() || '0')
                  }]
                };

                await studentApi.createStudent(newStudent);
                showToast('Student added successfully', 'success');
                setShowAddModal(false);
                fetchStudentData();
              } catch (error) {
                console.error('Error adding student:', error);
                showToast('Failed to add student', 'error');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                <label className="block text-sm font-medium text-gray-700">Enrollment Number</label>
                <input
                  type="text"
                  name="enrollmentNo"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch</label>
                  <select
                    name="batch"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Batch</option>
                    {batchOptions.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    name="semester"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admission Year</label>
                <input
                  type="number"
                  name="admissionYear"
                  min="2000"
                  max="2030"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <h4 className="text-md font-medium mt-4">Guardian Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation</label>
                  <input
                    type="text"
                    name="guardianRelation"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    name="guardianContact"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    name="guardianOccupation"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h4 className="text-md font-medium mt-4">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="text"
                    name="mobile"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h4 className="text-md font-medium mt-4">Education Background</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Board</label>
                  <input
                    type="text"
                    name="board"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Percentage</label>
                  <input
                    type="number"
                    name="percentage"
                    step="0.01"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year of Passing</label>
                  <input
                    type="number"
                    name="yearOfPassing"
                    min="2000"
                    max="2030"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;

function getStudentStatus(student: StudentWithDetails): string {
  if (student.isCancel) return 'Cancelled';
  if (student.termClose) return 'Term Closed';
  if (student.isComplete) {
    return student.isPassAll ? 'Completed & Passed' : 'Completed';
  }
  return 'Active';
}