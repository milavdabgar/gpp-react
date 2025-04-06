import React, { useState } from 'react';
import { ChevronLeft, Upload, Plus, Trash2, Info, Check, AlertCircle } from 'lucide-react';

const ProjectRegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState([{ id: 1, name: '', enrollment: '', role: '' }]);
  const [formData, setFormData] = useState({
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
      name: '',
      department: '',
      contactNumber: '',
    }
  });
  
  // Handle basic form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle team member changes
  const handleTeamMemberChange = (id, field, value) => {
    setTeamMembers(
      teamMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };
  
  // Add team member
  const addTeamMember = () => {
    if (teamMembers.length < 4) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now(), name: '', enrollment: '', role: '' }
      ]);
    }
  };
  
  // Remove team member
  const removeTeamMember = (id) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };
  
  // Navigate between form steps
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  // Department options
  const departments = [
    'Computer Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Electronics & Communication'
  ];
  
  // Project categories
  const categories = [
    'Software Development',
    'Hardware Project',
    'IoT & Smart Systems',
    'Sustainable Technology',
    'Industry Problem Solution',
    'Research & Innovation'
  ];
  
  // Submit form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Form validation would go here
    
    // For demo, just show success
    setStep(4); // Move to success step
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Registration - New Palanpur for New India</h2>
        <div className="text-sm bg-blue-600 px-2 py-1 rounded">
          April 9, 2025
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
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
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
                rows="4"
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Team Members</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add up to 4 team members including yourself
              </p>
              
              {teamMembers.map((member, index) => (
                <div key={member.id} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-gray-700">
                      {index === 0 ? 'Team Leader' : `Team Member ${index}`}
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
                        value={member.enrollment}
                        onChange={(e) => handleTeamMemberChange(member.id, 'enrollment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
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
                  rows="2"
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
                    value={formData.guide.name}
                    onChange={handleChange}
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
                    value={formData.guide.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
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
                      <li>Your project is ready for demonstration on April 9, 2025</li>
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
              >
                Submit Registration
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
                <span className="text-sm font-semibold">NPNI-2025-0042</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Department:</span>
                <span className="text-sm font-semibold">{formData.department}</span>
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
                    <li>Your stall/booth assignment will be shared on April 7th</li>
                    <li>Arrive by 8:30 AM on April 9th for setup</li>
                    <li>Department jury evaluation will be from 10:00 AM - 12:00 PM</li>
                    <li>Central jury evaluation will be from 2:00 PM - 4:00 PM</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-center">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Download Confirmation
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
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
