import React, { useState } from 'react';
import { Clock, User, Check, Filter, CheckCircle, BarChart } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  department: string;
  team: string;
  members: number;
  location: string;
  status: 'pending' | 'evaluated';
  score?: number;
  abstract: string;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface Scores {
  [key: string]: number;
}

const JuryEvaluation = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [evaluationType, setEvaluationType] = useState<'department' | 'central'>('department');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'evaluate'
  
  // Sample projects data
  const projects = [
    {
      id: 'NPNI-2025-0042',
      title: 'Smart Waste Management System',
      category: 'IoT & Smart Systems',
      department: 'Computer Engineering',
      team: 'Team Innovate',
      members: 3,
      location: 'Stall A-12',
      status: 'pending' as const,
      abstract: 'A smart waste management system that uses IoT sensors to monitor waste levels in bins and optimize collection routes for municipal workers.'
    },
    {
      id: 'NPNI-2025-0056',
      title: 'Solar Powered Water Purifier',
      category: 'Sustainable Technology',
      department: 'Electrical Engineering',
      team: 'EcoSolutions',
      members: 4,
      location: 'Stall B-08',
      status: 'pending' as const,
      abstract: 'A portable water purification system powered entirely by solar energy, designed for rural areas with limited electricity access.'
    },
    {
      id: 'NPNI-2025-0073',
      title: 'Structural Health Monitoring Device',
      category: 'Hardware Project',
      department: 'Civil Engineering',
      team: 'BuildTech',
      members: 2,
      location: 'Stall C-15',
      status: 'evaluated' as const,
      score: 82,
      abstract: 'A low-cost device that monitors the structural health of buildings and bridges, providing early warnings for potential failures.'
    }
  ];
  
  // Evaluation criteria based on jury type
  const evaluationCriteria: Record<'department' | 'central', EvaluationCriterion[]> = {
    department: [
      { id: 'innovation', name: 'Innovation & Originality', description: 'Uniqueness of the idea and approach', maxScore: 20 },
      { id: 'implementation', name: 'Implementation Quality', description: 'Quality of execution and working prototype', maxScore: 25 },
      { id: 'relevance', name: 'Problem Relevance', description: 'Addresses a significant real-world problem', maxScore: 20 },
      { id: 'presentation', name: 'Presentation & Documentation', description: 'Clear explanation and documentation', maxScore: 15 },
      { id: 'teamwork', name: 'Team Collaboration', description: 'Evidence of effective teamwork', maxScore: 10 },
      { id: 'completeness', name: 'Completeness', description: 'Project meets stated objectives', maxScore: 10 }
    ],
    central: [
      { id: 'innovation', name: 'Innovation & Originality', description: 'Uniqueness and novelty of the solution', maxScore: 25 },
      { id: 'implementation', name: 'Technical Excellence', description: 'Technical sophistication and quality', maxScore: 20 },
      { id: 'impact', name: 'Potential Impact', description: 'Potential for real-world application and impact', maxScore: 25 },
      { id: 'scalability', name: 'Scalability & Sustainability', description: 'Ability to scale and long-term viability', maxScore: 15 },
      { id: 'presentation', name: 'Presentation Quality', description: 'Professional presentation and communication', maxScore: 15 }
    ]
  };
  
  // Initial scores state
  const [scores, setScores] = useState<Scores>({});
  const [comments, setComments] = useState('');
  
  // Handle scoring change
  const handleScoreChange = (criteriaId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: parseInt(value)
    }));
  };
  
  // Start evaluating a project
  const startEvaluation = (project: Project) => {
    setCurrentProject(project);
    setViewMode('evaluate');
    // Initialize scores
    const initialScores: Scores = {};
    evaluationCriteria[evaluationType].forEach((criteria: EvaluationCriterion) => {
      initialScores[criteria.id] = 0;
    });
    setScores(initialScores);
    setComments('');
  };
  
  // Submit evaluation
  const submitEvaluation = () => {
    if (!currentProject) return;
    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);
    const maxPossibleScore = evaluationCriteria[evaluationType].reduce((sum: number, criteria: EvaluationCriterion) => sum + criteria.maxScore, 0);
    
    // Here you would send the data to your backend
    console.log('Submitting evaluation:', {
      projectId: currentProject.id,
      scores,
      totalScore,
      percentageScore: (totalScore / maxPossibleScore) * 100,
      comments,
      juryType: evaluationType
    });
    
    // For demo, just go back to list
    setViewMode('list');
    
    // Update project status in our local data (this would come from backend in real app)
    const updatedProjects = projects.map(p => 
      p.id === currentProject.id 
        ? { ...p, status: 'evaluated', score: Math.round((totalScore / maxPossibleScore) * 100) } 
        : p
    );
    
    // Reset state
    setCurrentProject(null);
  };
  
  // Calculate total score for current evaluation
  const calculateTotalScore = (): { current: number; max: number; percentage: number } => {
    if (!currentProject) return { current: 0, max: 0, percentage: 0 };
    const totalScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);
    const maxPossibleScore = evaluationCriteria[evaluationType].reduce((sum: number, criteria: EvaluationCriterion) => sum + criteria.maxScore, 0);
    return {
      current: totalScore,
      max: maxPossibleScore,
      percentage: Math.round((totalScore / maxPossibleScore) * 100)
    };
  };

  // Toggle between department and central jury views
  const toggleEvaluationType = () => {
    if (!currentProject) return;
    setEvaluationType(evaluationType === 'department' ? 'central' : 'department');
    if (viewMode === 'evaluate') {
      setViewMode('list');
      setCurrentProject(null);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Project Evaluation - {evaluationType === 'department' ? 'Department Jury' : 'Central Expert Jury'}
        </h2>
        <button 
          onClick={toggleEvaluationType}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-800 rounded text-sm"
        >
          Switch to {evaluationType === 'department' ? 'Central' : 'Department'} Jury View
        </button>
      </div>
      
      {/* Main content */}
      {viewMode === 'list' ? (
        <div>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('assigned')}
              >
                Assigned Projects
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'evaluated'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('evaluated')}
              >
                Evaluated Projects
              </button>
            </nav>
          </div>
          
          {/* Project list */}
          <div className="p-4">
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 flex items-center">
                <Filter size={16} className="mr-2" />
                <span className="font-medium">Filters:</span>
                <select className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs">
                  <option>All Departments</option>
                  <option>Computer Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Civil Engineering</option>
                </select>
                <select className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs">
                  <option>All Categories</option>
                  <option>IoT & Smart Systems</option>
                  <option>Software Development</option>
                  <option>Hardware Project</option>
                </select>
              </div>
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                <Clock size={14} className="mr-1" />
                {evaluationType === 'department' ? '10:00 AM - 12:00 PM' : '2:00 PM - 4:00 PM'}
              </div>
            </div>
            
            {/* Project cards */}
            <div className="space-y-4">
              {projects
                .filter(project => 
                  (activeTab === 'assigned' && project.status === 'pending') || 
                  (activeTab === 'evaluated' && project.status === 'evaluated')
                )
                .map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200">
                      <div>
                        <span className="text-xs font-medium text-gray-500">{project.id}</span>
                        <h3 className="font-medium text-lg">{project.title}</h3>
                      </div>
                      <div className="flex items-center">
                        {project.status === 'evaluated' && (
                          <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                            <CheckCircle size={14} className="mr-1" />
                            <span className="text-xs font-medium">{project.score}%</span>
                          </div>
                        )}
                        {project.status === 'pending' && (
                          <button
                            onClick={() => startEvaluation(project)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Start Evaluation
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-500 block">Department</span>
                          <span className="text-sm font-medium">{project.department}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Category</span>
                          <span className="text-sm font-medium">{project.category}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Location</span>
                          <span className="text-sm font-medium">{project.location}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 block">Abstract</span>
                        <p className="text-sm text-gray-700">{project.abstract}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-2">
                            <User size={14} />
                          </div>
                          <span className="text-sm text-gray-600">{project.team} ({project.members} members)</span>
                        </div>
                        {project.status === 'evaluated' && (
                          <button
                            onClick={() => startEvaluation(project)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Evaluation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Progress summary */}
            {activeTab === 'evaluated' && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <BarChart size={18} className="text-blue-600 mr-2" />
                  <h3 className="font-medium">Evaluation Progress</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-gray-600">Evaluated</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">1</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-gray-600">Total Assigned</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Evaluation form */}
          <div className="p-6">
            {/* Project details */}
            <div className="mb-6">
              {currentProject && (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500">{currentProject.id}</span>
                    <h3 className="text-xl font-semibold mb-2">{currentProject.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {currentProject.department}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {currentProject.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentProject.location}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                    <Clock size={14} className="mr-1" />
                    {evaluationType === 'department' ? '10:00 AM - 12:00 PM' : '2:00 PM - 4:00 PM'}
                  </div>
                </div>
              )}

              
              {currentProject && (
                <p className="text-gray-700 mb-4">{currentProject.abstract}</p>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <User size={16} className="mr-1" />
                {currentProject && (
                  <span>{currentProject.team} ({currentProject.members} members)</span>
                )}
              </div>
            </div>
            
            {/* Evaluation criteria */}
            <div className="mb-6">
              <h4 className="font-medium text-lg mb-4">Evaluation Criteria</h4>
              
              <div className="space-y-6">
                {evaluationCriteria[evaluationType].map((criteria) => (
                  <div key={criteria.id} className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h5 className="font-medium">{criteria.name}</h5>
                        <p className="text-sm text-gray-600">{criteria.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Max: {criteria.maxScore} points
                      </div>
                    </div>
                    
                    <div>
                      <input
                        type="range"
                        min="0"
                        max={criteria.maxScore}
                        value={scores[criteria.id] || 0}
                        onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>{Math.floor(criteria.maxScore / 4)}</span>
                        <span>{Math.floor(criteria.maxScore / 2)}</span>
                        <span>{Math.floor(criteria.maxScore * 3/4)}</span>
                        <span>{criteria.maxScore}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between">
                      <div className="text-xs text-gray-500">
                        {scores[criteria.id] === 0 && 'Not scored yet'}
                        {scores[criteria.id] > 0 && scores[criteria.id] <= criteria.maxScore * 0.3 && 'Needs improvement'}
                        {scores[criteria.id] > criteria.maxScore * 0.3 && scores[criteria.id] <= criteria.maxScore * 0.7 && 'Satisfactory'}
                        {scores[criteria.id] > criteria.maxScore * 0.7 && scores[criteria.id] < criteria.maxScore && 'Excellent'}
                        {scores[criteria.id] === criteria.maxScore && 'Outstanding'}
                      </div>
                      <div className="font-bold">
                        {scores[criteria.id] || 0}/{criteria.maxScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comments */}
            <div className="mb-6">
              <label className="block font-medium mb-2">
                Comments & Feedback (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Provide any additional comments or feedback for the team"
              ></textarea>
            </div>
            
            {/* Score summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <h4 className="font-medium mb-3">Score Summary</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-2xl font-bold">{currentProject ? calculateTotalScore().current : 0}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-2xl font-bold">{currentProject ? calculateTotalScore().max : 0}</div>
                  <div className="text-sm text-gray-600">Maximum Possible</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-2xl font-bold">{currentProject ? calculateTotalScore().percentage : 0}%</div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${currentProject ? calculateTotalScore().percentage : 0}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-center">
                {currentProject ? `${calculateTotalScore().current} out of ${calculateTotalScore().max} points` : 'No project selected'}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setViewMode('list');
                  setCurrentProject(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel & Return
              </button>
              <button
                onClick={submitEvaluation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={Object.keys(scores).length === 0}
              >
                <Check size={16} className="inline mr-1" />
                Submit Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuryEvaluation;
