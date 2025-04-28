import React, { useState, useEffect } from 'react';
import { FileText, User, MapPin, Calendar, Award, Clock, Download, ExternalLink } from 'lucide-react';
import { getProjectWithDetails } from '../../../services/projectApi';

interface ProjectViewProps {
  projectId: string | null;
  event?: any;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId, event }) => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProjectWithDetails(projectId);
        setProject(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-gray-600">
          <p>Project not found.</p>
          <p className="mt-2">The requested project may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const teamMembers = project.team?.members || [];
  const departmentDetails = project.departmentDetails || { name: project.department };
  const location = project.location || { locationId: 'Not Assigned' };
  const deptEvaluation = project.deptEvaluation || { status: 'pending' };
  const centralEvaluation = project.centralEvaluation || { status: 'pending' };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <span className="bg-blue-800 px-3 py-1 rounded text-sm">
            {project._id}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center">
            <FileText size={16} className="mr-1" />
            {project.category}
          </span>
          <span className="flex items-center">
            <User size={16} className="mr-1" />
            {project.team?.name || 'No team assigned'}
          </span>
          <span className="flex items-center">
            <MapPin size={16} className="mr-1" />
            {location.locationId}
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
            {teamMembers.length > 0 ? (
              teamMembers.map((member: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium">{member.fullName || member.name}</div>
                  <div className="text-sm text-gray-500">{member.enrollmentNo || 'No enrollment number'}</div>
                  <div className="text-sm text-blue-600">
                    {member.isLeader ? 'Team Leader' : member.role || 'Member'}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                No team members found
              </div>
            )}
          </div>
        </section>

        {/* Project Guide */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Project Guide</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium">{project.guide?.name || 'Not assigned'}</div>
            <div className="text-sm text-gray-500">
              {project.guide?.department?.name || project.guideDetails?.department?.name || 'Department not specified'}
            </div>
            {project.guide?.contactNumber && (
              <div className="text-sm text-blue-600 mt-1">Contact: {project.guide.contactNumber}</div>
            )}
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
                  {project.requirements?.power ? 'Required' : 'Not Required'}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Internet Connection</div>
                <div className="text-sm text-gray-600">
                  {project.requirements?.internet ? 'Required' : 'Not Required'}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Special Space</div>
                <div className="text-sm text-gray-600">
                  {project.requirements?.specialSpace ? 'Required' : 'Not Required'}
                </div>
              </div>
            </div>
            {project.requirements?.otherRequirements && (
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
                  deptEvaluation.completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {deptEvaluation.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              {deptEvaluation.completed && deptEvaluation.score && (
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {deptEvaluation.score}/100
                </div>
              )}
              {deptEvaluation.completed && deptEvaluation.feedback && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Feedback:</div>
                  {deptEvaluation.feedback}
                </div>
              )}
              {deptEvaluation.completed && deptEvaluation.juryId && (
                <div className="text-sm text-gray-500 mt-2">
                  Evaluated by: {project.deptJuryDetails?.name || 'Unknown Jury'}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Central Expert Evaluation</div>
                <span className={`px-2 py-1 rounded text-sm ${
                  centralEvaluation.completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {centralEvaluation.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              {centralEvaluation.completed && centralEvaluation.score && (
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {centralEvaluation.score}/100
                </div>
              )}
              {centralEvaluation.completed && centralEvaluation.feedback && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Feedback:</div>
                  {centralEvaluation.feedback}
                </div>
              )}
              {centralEvaluation.completed && centralEvaluation.juryId && (
                <div className="text-sm text-gray-500 mt-2">
                  Evaluated by: {project.centralJuryDetails?.name || 'Unknown Jury'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Schedule */}
        {event && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Event Day Schedule</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-3">
                <Calendar size={16} className="inline mr-1" />
                Event Date: {formatDate(event.eventDate)}
              </div>
              
              <div className="space-y-4">
                {/* Loop through the event schedule relevant to this project */}
                {event.schedule && event.schedule.map((item: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <Clock size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{item.activity}</div>
                      <div className="text-sm text-gray-600">{item.time} - {item.location}</div>
                    </div>
                  </div>
                ))}
                
                {(!event.schedule || event.schedule.length === 0) && (
                  <div className="text-sm text-gray-500">
                    No schedule information available.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        
        {/* Actions */}
        {event?.publishResults && (
          <div className="mt-6 flex justify-end space-x-3">
            {deptEvaluation.completed && (
              <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                <Download size={16} className="mr-1" />
                Download Certificate
              </button>
            )}
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              <ExternalLink size={16} className="mr-1" />
              View Project Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;