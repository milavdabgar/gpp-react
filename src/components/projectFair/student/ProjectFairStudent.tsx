import React, { useState } from 'react';
import ProjectList from './ProjectList';
import ProjectView from './ProjectView';
import { ChevronLeft } from 'lucide-react';

const ProjectFairStudent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProjectId(null);
  };

  return (
    <div className="p-4">
      {viewMode === 'list' ? (
        <ProjectList onViewProject={handleViewProject} />
      ) : (
        <div>
          <button
            onClick={handleBackToList}
            className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Projects
          </button>
          <ProjectView projectId={selectedProjectId} />
        </div>
      )}
    </div>
  );
};

export default ProjectFairStudent;
