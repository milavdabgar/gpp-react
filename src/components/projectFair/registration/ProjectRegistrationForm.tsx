import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ChevronLeft, Upload, Plus, Trash2, Info, Check, AlertCircle } from 'lucide-react';
import projectService from '../../../services/projectApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ProjectEvent, Team, Project } from '../../../types/project.types';

interface User {
  _id: string;
  name: string;
  department?: string | { _id: string; name: string };
}

interface TeamMember {
  id: number;
  name: string;
  enrollmentNo: string;
  role: string;
  isLeader: boolean;
}

interface FormData {
  projectTitle: string;
  projectCategory: string;
  department: string;
  abstract: string;
  requirements: {
    power: boolean;
    internet: boolean;
    specialSpace: boolean;
    otherRequirements: string;
  };
  guide: {
    userId: string;
    name: string;
    department: string;
    contactNumber: string;
  };
  eventId: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

interface Faculty {
  _id: string;
  name: string;
  department: any;
  email: string;
}

interface ProjectRegistrationFormProps {
  event?: ProjectEvent;
}

const ProjectRegistrationForm: React.FC<ProjectRegistrationFormProps> = ({ event }) => {
  const { user } = useAuth() as { user: User | null };
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: user?.name || '', enrollmentNo: '', role: 'Team Leader', isLeader: true }
  ]);
  const [formData, setFormData] = useState<FormData>({
    projectTitle: '',
    projectCategory: '',
    department: '',
    abstract: '',
    requirements: {
      power: false,
      internet: false,
      specialSpace: false,
      otherRequirements: '',
    },
    guide: {
      userId: '',
      name: '',
      department: '',
      contactNumber: '',
    },
    eventId: event?._id || ''
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [activeEvents, setActiveEvents] = useState<ProjectEvent[]>(event ? [event] : []);
  const [teamId, setTeamId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  
  // Project categories
  const categories = [
    'Software Development',
    'Hardware Project',
    'IoT & Smart Systems',
    'Sustainable Technology',
    'Industry Problem Solution',
    'Research & Innovation'
  ];
  
  // Load initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch active events
      const eventsData = await projectService.getActiveEvents();
      setActiveEvents(eventsData || []);
      
      if (eventsData && eventsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          eventId: eventsData[0]._id
        }));
      }
      
      // If user is logged in, add department and prefill first team member
      if (user) {
        // Set department from user if available
        if (user.department) {
          setFormData(prev => ({
            ...prev,
            department: typeof user.department === 'string' ? user.department : user.department?._id || ''
          }));
        }
        
        // Check if user has existing teams
        await fetchUserTeams();
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      showToast('Failed to load initial data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserTeams = async () => {
    try {
      // Check if user has existing teams
      const userTeams = await projectService.getMyTeams();
      
      if (userTeams && userTeams.length > 0) {
        // Use the first team by default
        const firstTeam = userTeams[0];
        setTeamId(firstTeam._id);
        
        // Set team members from existing team
        if (firstTeam.members && firstTeam.members.length > 0) {
          const mappedMembers = firstTeam.members.map((member: any, index) => ({
            id: index + 1,
            name: member.fullName || member.name || (member.userId && typeof member.userId === 'object' ? member.userId.name : ''),
            enrollmentNo: member.enrollmentNo || '',
            role: member.role || (index === 0 ? 'Team Leader' : 'Member'),
            isLeader: member.isLeader || index === 0
          }));
          
          setTeamMembers(mappedMembers);
        }
        
        // Check if user has existing projects for this team
        const teamProjects = await projectService.getProjectsByTeam(firstTeam._id);
        if (teamProjects && teamProjects.length > 0) {
          // User already has a project, redirect to project view
          showToast('You already have a project registered. Redirecting to your project.', 'info');
        }
      }
    } catch (err) {
      console.error('Error fetching user teams:', err);
    }
  };
  
  // Handle basic form field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' 
      ? target.checked 
      : target.value;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.') as [keyof FormData, string];
      if (parent === 'requirements' || parent === 'guide') {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name as keyof FormData]: value
      }));
    }
  };
  
  // Handle guide selection change
  const handleGuideChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedFacultyId = e.target.value;
    const selectedFaculty = faculties.find(f => f._id === selectedFacultyId);
    
    if (selectedFaculty) {
      setFormData({
        ...formData,
        guide: {
          userId: selectedFaculty._id,
          name: selectedFaculty.name,
          department: typeof selectedFaculty.department === 'string' 
            ? selectedFaculty.department 
            : selectedFaculty.department._id,
          contactNumber: formData.guide.contactNumber // Preserve existing contact number
        }
      });
    }
  };
  
  // Handle team member changes
  const handleTeamMemberChange = (id: number, field: keyof TeamMember, value: string | boolean) => {
    setTeamMembers(
      teamMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
    
    // If changing leader status, update other members accordingly
    if (field === 'isLeader' && value === true) {
      setTeamMembers(
        teamMembers.map(member => 
          member.id === id 
            ? { ...member, isLeader: true, role: 'Team Leader' } 
            : { ...member, isLeader: false, role: member.role === 'Team Leader' ? 'Member' : member.role }
        )
      );
    }
  };
  
  // Add team member
  const addTeamMember = () => {
    if (teamMembers.length < 4) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now(), name: '', enrollmentNo: '', role: 'Member', isLeader: false }
      ]);
    } else {
      showToast('Maximum team size is 4 members.', 'warning');
    }
  };
  
  // Remove team member
  const removeTeamMember = (id: number) => {
    if (teamMembers.length > 1) {
      const updatedMembers = teamMembers.filter(member => member.id !== id);
      
      // If we're removing the leader, assign leadership to the first remaining member
      const hasLeader = updatedMembers.some(member => member.isLeader);
      if (!hasLeader && updatedMembers.length > 0) {
        updatedMembers[0].isLeader = true;
        updatedMembers[0].role = 'Team Leader';
      }
      
      setTeamMembers(updatedMembers);
    } else {
      showToast('Team must have at least one member.', 'warning');
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('File size exceeds 5MB limit', 'error');
        return;
      }
      
      setFileSelected(file);
      showToast('File selected successfully', 'success');
    }
  };
  
  // Navigate between form steps
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  // Form validation
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.projectTitle) {
          showToast('Project title is required', 'error');
          return false;
        }
        if (!formData.projectCategory) {
          showToast('Project category is required', 'error');
          return false;
        }
        if (!formData.department) {
          showToast('Department is required', 'error');
          return false;
        }
        if (!formData.abstract || formData.abstract.length < 50) {
          showToast('Please provide a detailed abstract (minimum 50 characters)', 'error');
          return false;
        }
        return true;
      
      case 2:
        // Validate team members
        for (const member of teamMembers) {
          if (!member.name) {
            showToast('All team members must have a name', 'error');
            return false;
          }
          if (!member.enrollmentNo) {
            showToast('All team members must have an enrollment number', 'error');
            return false;
          }
        }
        
        // Ensure at least one leader
        if (!teamMembers.some(member => member.isLeader)) {
          showToast('Team must have a designated leader', 'error');
          return false;
        }
        
        return true;
      
      case 3:
        if (!formData.guide.name && !formData.guide.userId) {
          showToast('Please select or enter a guide', 'error');
          return false;
        }
        if (!formData.guide.contactNumber) {
          showToast('Guide contact number is required', 'error');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    try {
      setLoading(true);
      
      // Step 1: Create or use existing team
      let currentTeamId = teamId;
      if (!currentTeamId) {
        // Create a team first
        const teamData: Partial<Team> = {
          name: `Team ${teamMembers[0].name.split(' ')[0]}`, // Use first name of first member
          department: formData.department,
          members: teamMembers.map(member => member.name),
          leader: teamMembers.find(member => member.isLeader)?.name || teamMembers[0].name,
          eventId: formData.eventId
        };
        
        const teamResponse = await projectService.createTeam(teamData);
        currentTeamId = teamResponse._id;
      }
      
      // Step 2: Create the project
      const projectData = {
        title: formData.projectTitle,
        category: formData.projectCategory,
        abstract: formData.abstract,
        department: formData.department,
        requirements: formData.requirements,
        guide: formData.guide,
        teamId: currentTeamId,
        eventId: formData.eventId,
        status: 'submitted'
      };
      
      const projectResponse = await projectService.createProject(projectData);
      setProjectId(projectResponse._id);
      
      // Step 3: Upload poster/image if selected
      if (fileSelected) {
        // This would typically be implemented with a file upload API
        // For now, we'll just simulate success
        console.log('Uploading file:', fileSelected.name);
      }
      
      // Move to success step
      setStep(4);
      showToast('Project registered successfully!', 'success');
    } catch (err) {
      console.error('Error registering project:', err);
      showToast('Failed to register project', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Registration - New Palanpur for New India</h2>
        <div className="text-sm bg-blue-600 px-2 py-1 rounded">
          {activeEvents.length > 0 ? new Date(activeEvents[0].eventDate).toLocaleDateString() : 'Event Date TBD'}
        </div>
      </div>
      
      {/* Progress steps */}
      {step < 4 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between">
            {['Project Details', 'Team Information', 'Requirements & Guide'].map((label, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${index + 1 < step ? 'text-blue-600' : index + 1 === step ? 'text-blue-800' : 'text-gray-400'}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold mb-1 ${
                  index + 1 < step 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : index + 1 === step 
                    ? 'border-blue-800 text-blue-800' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {index + 1 < step ? '✓' : index + 1}
                </div>
                <span className="text-xs hidden sm:block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a descriptive title for your project"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectCategory"
                  value={formData.projectCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a brief description of your project, its objectives, and expected outcomes (100-300 words)"
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Explain what problem your project solves and how it is innovative
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Poster/Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                <Upload size={36} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 5MB (JPG, PNG, PDF)
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="mt-4 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100 cursor-pointer"
                >
                  {fileSelected ? 'Change File' : 'Upload File'}
                </label>
                {fileSelected && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {fileSelected.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => validateStep(1) && nextStep()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                Next: Team Information
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Team Information */}
        {step === 2 && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Members</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add up to 4 team members including yourself
              </p>
              
              {teamMembers.map((member, index) => (
                <div key={member.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-gray-700">
                      {member.isLeader ? 'Team Leader' : `Team Member ${index}`}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(member.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enrollment No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={member.enrollmentNo}
                        onChange={(e) => handleTeamMemberChange(member.id, 'enrollmentNo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role in Project
                      </label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => handleTeamMemberChange(member.id, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Frontend Developer, Hardware Design, etc."
                      />
                    </div>
                    
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id={`leader-${member.id}`}
                        checked={member.isLeader}
                        onChange={(e) => handleTeamMemberChange(member.id, 'isLeader', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`leader-${member.id}`} className="ml-2 block text-sm text-gray-700">
                        This member is the team leader
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              {teamMembers.length < 4 && (
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                >
                  <Plus size={16} className="mr-1" /> 
                  Add Another Team Member
                </button>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <ChevronLeft size={16} className="inline mr-1" /> Back
              </button>
              <button
                type="button"
                onClick={() => validateStep(2) && nextStep()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                Next: Requirements & Guide
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Requirements & Guide */}
        {step === 3 && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Requirements</h3>
              <p className="text-sm text-gray-600 mb-4">
                Specify any special requirements for your project setup
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="power"
                    name="requirements.power"
                    checked={formData.requirements.power}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <label htmlFor="power" className="ml-2 text-sm text-gray-700">
                    Special power requirements (beyond standard power outlet)
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="internet"
                    name="requirements.internet"
                    checked={formData.requirements.internet}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <label htmlFor="internet" className="ml-2 text-sm text-gray-700">
                    Internet connectivity required
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="specialSpace"
                    name="requirements.specialSpace"
                    checked={formData.requirements.specialSpace}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <label htmlFor="specialSpace" className="ml-2 text-sm text-gray-700">
                    Extra space required (beyond standard table)
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Requirements or Special Considerations
                </label>
                <textarea
                  name="requirements.otherRequirements"
                  value={formData.requirements.otherRequirements}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any other specific requirements or considerations for your project setup"
                ></textarea>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Guide Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Guide <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.guide.userId}
                    onChange={handleGuideChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Guide</option>
                    {faculties.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} - {typeof faculty.department === 'object' ? faculty.department.name : faculty.department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guide Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guide.name"
                    value={formData.guide.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-filled when you select a guide, or enter manually if your guide is not listed
                  </p>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guide.contactNumber"
                    value={formData.guide.contactNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-6">
              <div className="flex">
                <Info size={20} className="text-yellow-500 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-1 text-xs text-yellow-700">
                    <p>By submitting this form, you confirm that:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>All team members will be present during the project fair</li>
                      <li>Your project is ready for demonstration on {activeEvents.length > 0 ? new Date(activeEvents[0].eventDate).toLocaleDateString() : 'event day'}</li>
                      <li>Your guide has approved this project submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                <ChevronLeft size={16} className="inline mr-1" /> Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Success Confirmation */}
        {step === 4 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your project has been successfully registered for the New Palanpur for New India Project Fair.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Project ID:</span>
                <span className="text-sm font-semibold">{projectId || 'NPNI-2025-0042'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Department:</span>
                <span className="text-sm font-semibold">
                  {departments.find(d => d._id === formData.department)?.name || 'Department'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Category:</span>
                <span className="text-sm font-semibold">{formData.projectCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Team Size:</span>
                <span className="text-sm font-semibold">{teamMembers.length} members</span>
              </div>
            </div>
            
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Next Steps</h4>
                  <ul className="mt-1 text-sm text-blue-700 list-disc ml-4 space-y-1">
                    <li>You'll receive a confirmation email with all details</li>
                    <li>Your stall/booth assignment will be shared two days before the event</li>
                    <li>Arrive by 8:30 AM on event day for setup</li>
                    <li>Department jury evaluation will be from 10:00 AM - 12:00 PM</li>
                    <li>Central jury evaluation will be from 2:00 PM - 4:00 PM</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={() => window.print()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download Confirmation
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/project-fair'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectRegistrationForm;