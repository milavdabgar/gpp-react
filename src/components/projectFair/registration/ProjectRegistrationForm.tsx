import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, Plus, Trash2, Info, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as projectService from '../../services/project.service';

const ProjectRegistrationForm = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Team state
  const [teamData, setTeamData] = useState({
    name: '',
    department: '',
    members: [],
    eventId: '',
  });

  // Project state
  const [projectData, setProjectData] = useState({
    title: '',
    category: '',
    abstract: '',
    department: '',
    requirements: {
      power: false,
      internet: false,
      specialSpace: false,
      otherRequirements: '',
    },
    guide: {
      name: '',
      department: '',
      contactNumber: '',
    },
    teamId: '',
    eventId: '',
  });

  // Project categories
  const categories = [
    'Software Development',
    'Hardware Project',
    'IoT & Smart Systems',
    'Sustainable Technology',
    'Industry Problem Solution',
    'Research & Innovation'
  ];

  // Fetch active event and departments on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch active events
        const eventsResponse = await projectService.getActiveEvents();
        const events = eventsResponse.data.events;

        if (events && events.length > 0) {
          setActiveEvent(events[0]);

          // Set event ID in form data
          setTeamData(prev => ({ ...prev, eventId: events[0]._id }));
          setProjectData(prev => ({ ...prev, eventId: events[0]._id }));
        } else {
          setError('No active events found. Registration is currently closed.');
        }

        // Fetch departments
        const departmentsResponse = await axios.get('/api/departments');
        setDepartments(departmentsResponse.data.data.departments);

        // If user is logged in and has department, pre-fill it
        if (user && user.department) {
          setTeamData(prev => ({ ...prev, department: user.department }));
          setProjectData(prev => ({
            ...prev,
            department: user.department,
            guide: { ...prev.guide, department: user.department }
          }));
        }
      } catch (err) {
        setError('Error loading initial data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // Fetch existing teams for the current user
  useEffect(() => {
    if (user && step === 2) {
      const fetchUserTeams = async () => {
        try {
          const response = await projectService.getMyTeams();
          const teams = response.data.teams;

          if (teams && teams.length > 0) {
            // Add an option to use existing team or create a new one
            setExistingTeams(teams);
          }
        } catch (err) {
          console.error('Error fetching user teams:', err);
        }
      };

      fetchUserTeams();
    }
  }, [user, step]);

  // State for existing teams
  const [existingTeams, setExistingTeams] = useState([]);
  const [useExistingTeam, setUseExistingTeam] = useState(false);
  const [selectedExistingTeam, setSelectedExistingTeam] = useState('');

  // Handle basic form field changes for project data
  const handleProjectDataChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProjectData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProjectData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle basic form field changes for team data
  const handleTeamDataChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle department change
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setTeamData(prev => ({ ...prev, department: departmentId }));
    setProjectData(prev => ({
      ...prev,
      department: departmentId,
      guide: { ...prev.guide, department: departmentId }
    }));
  };

  // Handle team member changes
  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamData.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setTeamData(prev => ({ ...prev, members: updatedMembers }));
  };

  // Add team member
  const addTeamMember = () => {
    if (teamData.members.length < 4) {
      setTeamData(prev => ({
        ...prev,
        members: [
          ...prev.members,
          { name: '', enrollmentNo: '', role: '', isLeader: false }
        ]
      }));
    }
  };

  // Remove team member
  const removeTeamMember = (index) => {
    if (teamData.members.length > 1) {
      const updatedMembers = [...teamData.members];
      updatedMembers.splice(index, 1);

      // Ensure at least one leader
      if (!updatedMembers.some(m => m.isLeader) && updatedMembers.length > 0) {
        updatedMembers[0].isLeader = true;
        updatedMembers[0].role = 'Team Leader';
      }

      setTeamData(prev => ({ ...prev, members: updatedMembers }));
    }
  };

  // Handle existing team selection
  const handleExistingTeamSelect = (e) => {
    const teamId = e.target.value;
    setSelectedExistingTeam(teamId);

    if (teamId) {
      const selectedTeam = existingTeams.find(team => team._id === teamId);

      if (selectedTeam) {
        // Update project data with team ID and department
        setProjectData(prev => ({
          ...prev,
          teamId: teamId,
          department: selectedTeam.department._id || selectedTeam.department
        }));
      }
    }
  };

  // Handle existing team toggle
  const toggleUseExistingTeam = () => {
    setUseExistingTeam(!useExistingTeam);

    if (!useExistingTeam && existingTeams.length > 0) {
      // Default to first team
      setSelectedExistingTeam(existingTeams[0]._id);

      // Update project data with team ID and department
      setProjectData(prev => ({
        ...prev,
        teamId: existingTeams[0]._id,
        department: existingTeams[0].department._id || existingTeams[0].department
      }));
    } else {
      // Reset team-related fields in project data
      setSelectedExistingTeam('');
      setProjectData(prev => ({
        ...prev,
        teamId: ''
      }));
    }
  };

  // Initialize team with current user
  useEffect(() => {
    if (user && teamData.members.length === 0) {
      setTeamData(prev => ({
        ...prev,
        members: [
          {
            name: user.name || '',
            enrollmentNo: '', // Would fetch from student model in real implementation
            role: 'Team Leader',
            isLeader: true,
            userId: user._id
          }
        ]
      }));
    }
  }, [user]);

  // Navigate between form steps
  const nextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!projectData.title || !projectData.category || !projectData.department || !projectData.abstract) {
        setError('Please fill in all required fields.');
        return;
      }
      setError(null);
    } else if (step === 2) {
      if (useExistingTeam && !selectedExistingTeam) {
        setError('Please select a team.');
        return;
      } else if (!useExistingTeam) {
        if (!teamData.name || !teamData.department) {
          setError('Please provide a team name and department.');
          return;
        }

        if (teamData.members.length === 0) {
          setError('Team must have at least one member.');
          return;
        }

        const hasValidMembers = teamData.members.every(member => member.name && member.enrollmentNo);
        if (!hasValidMembers) {
          setError('Please provide name and enrollment number for all team members.');
          return;
        }

        const hasLeader = teamData.members.some(member => member.isLeader);
        if (!hasLeader) {
          setError('Team must have at least one leader.');
          return;
        }
      }
      setError(null);
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First create/select team
      let teamId;

      if (useExistingTeam) {
        teamId = selectedExistingTeam;
      } else {
        // Create new team
        const teamResponse = await projectService.createTeam(teamData);
        teamId = teamResponse.data.team._id;
      }

      // Then create project with team ID
      const finalProjectData = {
        ...projectData,
        teamId: teamId
      };

      const projectResponse = await projectService.createProject(finalProjectData);

      // Move to success step
      setSuccess({
        projectId: projectResponse.data.project._id,
        title: projectResponse.data.project.title,
        department: departments.find(d => d._id === projectResponse.data.project.department)?.name || 'Unknown',
        category: projectResponse.data.project.category,
        teamSize: useExistingTeam
          ? existingTeams.find(t => t._id === selectedExistingTeam)?.members?.length
          : teamData.members.length
      });

      setStep(4);
    } catch (err) {
      setError('Error submitting project: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // If no active event, show message
  if (!loading && !activeEvent && step < 4) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
        <p className="text-gray-600 mb-4">
          Project registration is currently closed. There are no active events accepting registrations.
        </p>
        <p className="text-gray-500 text-sm">
          Please check back later or contact the event coordinator for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Registration - {activeEvent?.name || 'New Palanpur for New India'}</h2>
        <div className="text-sm bg-blue-600 px-2 py-1 rounded">
          {activeEvent?.eventDate
            ? new Date(activeEvent.eventDate).toLocaleDateString()
            : 'April 9, 2025'}
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
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold mb-1 ${index + 1 < step
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

      {loading && step < 4 && (
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
        <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {!loading && (
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
                  name="title"
                  value={projectData.title}
                  onChange={handleProjectDataChange}
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
                    name="category"
                    value={projectData.category}
                    onChange={handleProjectDataChange}
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
                    value={projectData.department}
                    onChange={handleDepartmentChange}
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
                  value={projectData.abstract}
                  onChange={handleProjectDataChange}
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
                  <button
                    type="button"
                    className="mt-4 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-md hover:bg-blue-100"
                  >
                    Upload File
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Information</h3>

                {existingTeams.length > 0 && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start mb-3">
                      <input
                        type="checkbox"
                        id="useExistingTeam"
                        checked={useExistingTeam}
                        onChange={toggleUseExistingTeam}
                        className="mt-1"
                      />
                      <label htmlFor="useExistingTeam" className="ml-2 text-blue-800 font-medium">
                        Use an existing team
                      </label>
                    </div>

                    {useExistingTeam && (
                      <div>
                        <select
                          value={selectedExistingTeam}
                          onChange={handleExistingTeamSelect}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select a team</option>
                          {existingTeams.map(team => (
                            <option key={team._id} value={team._id}>
                              {team.name} ({team.members.length} members)
                            </option>
                          ))}
                        </select>

                        {selectedExistingTeam && (
                          <div className="mt-3 text-sm text-blue-800">
                            Using an existing team will skip team creation.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!useExistingTeam && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={teamData.name}
                        onChange={handleTeamDataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your team name"
                        required
                      />
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Add up to 4 team members including yourself
                    </p>

                    {teamData.members.map((member, index) => (
                      <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-700">
                            {member.isLeader ? 'Team Leader' : `Team Member ${index}`}
                          </h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeTeamMember(index)}
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
                              onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
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
                              onChange={(e) => handleTeamMemberChange(index, 'enrollmentNo', e.target.value)}
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
                              onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Frontend Developer, Hardware Design, etc."
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`isLeader${index}`}
                              checked={member.isLeader}
                              onChange={(e) => {
                                // If this is being checked, uncheck others
                                if (e.target.checked) {
                                  const updatedMembers = teamData.members.map((m, i) => ({
                                    ...m,
                                    isLeader: i === index,
                                    role: i === index ? 'Team Leader' : m.role
                                  }));
                                  setTeamData(prev => ({ ...prev, members: updatedMembers }));
                                } else {
                                  // Don't allow unchecking if this is the only leader
                                  const otherLeaders = teamData.members.filter((m, i) => i !== index && m.isLeader);
                                  if (otherLeaders.length === 0) {
                                    return; // Prevent unchecking
                                  }
                                  handleTeamMemberChange(index, 'isLeader', false);
                                }
                              }}
                              className="mt-1 mr-2"
                            />
                            <label htmlFor={`isLeader${index}`} className="text-sm text-gray-700">
                              Team Leader
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    {teamData.members.length < 4 && (
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Another Team Member
                      </button>
                    )}
                  </>
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
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      checked={projectData.requirements.power}
                      onChange={handleProjectDataChange}
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
                      checked={projectData.requirements.internet}
                      onChange={handleProjectDataChange}
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
                      checked={projectData.requirements.specialSpace}
                      onChange={handleProjectDataChange}
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
                    value={projectData.requirements.otherRequirements}
                    onChange={handleProjectDataChange}
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
                      Guide Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="guide.name"
                      value={projectData.guide.name}
                      onChange={handleProjectDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="guide.department"
                      value={projectData.guide.department}
                      onChange={handleProjectDataChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="guide.contactNumber"
                      value={projectData.guide.contactNumber}
                      onChange={handleProjectDataChange}
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
                        <li>Your project is ready for demonstration on {activeEvent?.eventDate
                          ? new Date(activeEvent.eventDate).toLocaleDateString()
                          : 'the event date'}</li>
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
                >
                  <ChevronLeft size={16} className="inline mr-1" /> Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success Confirmation */}
          {step === 4 && success && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your project has been successfully registered for the {activeEvent?.name || 'project fair'}.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Project ID:</span>
                  <span className="text-sm font-semibold">{success.projectId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Department:</span>
                  <span className="text-sm font-semibold">{success.department}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-semibold">{success.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Team Size:</span>
                  <span className="text-sm font-semibold">{success.teamSize} members</span>
                </div>
              </div>

              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Next Steps</h4>
                    <ul className="mt-1 text-sm text-blue-700 list-disc ml-4 space-y-1">
                      <li>You'll receive a confirmation email with all details</li>
                      <li>Your stall/booth assignment will be shared before the event</li>
                      <li>Arrive early on the event day for setup</li>
                      <li>Department jury evaluation will be from 10:00 AM - 12:00 PM</li>
                      <li>Central jury evaluation will be from 2:00 PM - 4:00 PM</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 justify-center">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => window.print()}
                >
                  Print Confirmation
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default ProjectRegistrationForm;