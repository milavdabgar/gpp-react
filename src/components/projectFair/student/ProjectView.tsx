import React from 'react';
import { FileText, User, MapPin, Calendar, Award, Clock } from 'lucide-react';

interface ProjectViewProps {
  projectId: string | null;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId }) => {
  // Sample project data - In production, this would come from props or API
  const project = {
    id: 'NPNI-2025-0042',
    title: 'Smart Waste Management System',
    category: 'IoT & Smart Systems',
    department: 'Computer Engineering',
    team: 'Team Innovate',
    members: [
      { name: 'John Doe', enrollment: 'CE2025001', role: 'Team Lead' },
      { name: 'Jane Smith', enrollment: 'CE2025002', role: 'Developer' },
      { name: 'Mike Johnson', enrollment: 'CE2025003', role: 'Hardware Design' }
    ],
    location: 'Stall A-12',
    registrationDate: '2025-04-01',
    guide: {
      name: 'Dr. Amit Patel',
      department: 'Computer Engineering',
      contactNumber: '9876543210'
    },
    abstract: 'A smart waste management system that uses IoT sensors to monitor waste levels in bins and optimize collection routes for municipal workers.',
    requirements: {
      power: true,
      internet: true,
      specialSpace: false,
      otherRequirements: 'Need a table for laptop setup'
    },
    evaluations: {
      department: {
        status: 'completed',
        score: 85,
        feedback: 'Excellent implementation with good practical application'
      },
      central: {
        status: 'pending',
        score: null,
        feedback: null
      }
    },
    schedule: {
      setup: '08:30 AM - 09:30 AM',
      departmentEvaluation: '10:00 AM - 12:00 PM',
      centralEvaluation: '02:00 PM - 04:00 PM'
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <span className="bg-blue-800 px-3 py-1 rounded text-sm">
            {project.id}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center">
            <FileText size={16} className="mr-1" />
            {project.category}
          </span>
          <span className="flex items-center">
            <User size={16} className="mr-1" />
            {project.team}
          </span>
          <span className="flex items-center">
            <MapPin size={16} className="mr-1" />
            {project.location}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Abstract */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Project Abstract</h2>
          <p className="text-gray-600">{project.abstract}</p>
        </section>

        {/* Team Information */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Team Members</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {project.members.map((member, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-gray-500">{member.enrollment}</div>
                <div className="text-sm text-blue-600">{member.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Guide */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Project Guide</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium">{project.guide.name}</div>
            <div className="text-sm text-gray-500">{project.guide.department}</div>
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Project Requirements</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="font-medium mb-1">Power Supply</div>
                <div className="text-sm text-gray-600">
                  {project.requirements.power ? 'Required' : 'Not Required'}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Internet Connection</div>
                <div className="text-sm text-gray-600">
                  {project.requirements.internet ? 'Required' : 'Not Required'}
                </div>
              </div>
            </div>
            {project.requirements.otherRequirements && (
              <div>
                <div className="font-medium mb-1">Additional Requirements</div>
                <div className="text-sm text-gray-600">
                  {project.requirements.otherRequirements}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Evaluation Status */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Evaluation Status</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Department Evaluation</div>
                <span className={`px-2 py-1 rounded text-sm ${
                  project.evaluations.department.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.evaluations.department.status}
                </span>
              </div>
              {project.evaluations.department.score && (
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {project.evaluations.department.score}/100
                </div>
              )}
              {project.evaluations.department.feedback && (
                <div className="text-sm text-gray-600">
                  {project.evaluations.department.feedback}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Central Expert Evaluation</div>
                <span className={`px-2 py-1 rounded text-sm ${
                  project.evaluations.central.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.evaluations.central.status}
                </span>
              </div>
              {project.evaluations.central.score && (
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {project.evaluations.central.score}/100
                </div>
              )}
              {project.evaluations.central.feedback && (
                <div className="text-sm text-gray-600">
                  {project.evaluations.central.feedback}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Event Day Schedule</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">Setup Time</div>
                  <div className="text-sm text-gray-600">{project.schedule.setup}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Award size={16} className="text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">Department Evaluation</div>
                  <div className="text-sm text-gray-600">{project.schedule.departmentEvaluation}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Award size={16} className="text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">Central Expert Evaluation</div>
                  <div className="text-sm text-gray-600">{project.schedule.centralEvaluation}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectView;
