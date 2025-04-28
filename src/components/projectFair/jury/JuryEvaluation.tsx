import React, { useState, useEffect } from 'react';
import { Clock, User, Check, Filter, CheckCircle, BarChart } from 'lucide-react';
import projectService from '../../../services/projectApi';
import { Project, EvaluationData, ProjectEvent } from '../../../types/project.types';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface Scores {
  [key: string]: number;
}

interface JuryProjectsResponse {
  evaluatedProjects: Project[];
  pendingProjects: Project[];
}

interface JuryEvaluationProps {
  event: ProjectEvent;
}

const JuryEvaluation: React.FC<JuryEvaluationProps> = ({ event }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [evaluationType, setEvaluationType] = useState<'department' | 'central'>('department');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'evaluate'
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluatedProjects, setEvaluatedProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [comments, setComments] = useState('');
  
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

  // Load projects when component mounts or evaluation type changes
  useEffect(() => {
    fetchProjects();
  }, [evaluationType]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectsForJury(evaluationType);
      const projects = Array.isArray(response) ? response : [];
      
      // Split projects into evaluated and pending
      const evaluated = projects.filter(p => p.evaluated);
      const pending = projects.filter(p => !p.evaluated);
      
      setEvaluatedProjects(evaluated);
      setPendingProjects(pending);
      setProjects([...evaluated, ...pending]);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setEvaluatedProjects([]);
      setPendingProjects([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Start evaluating a project
  const startEvaluation = (project: Project) => {
    setCurrentProject(project);
    setViewMode('evaluate');
    
    // Initialize scores
    const initialScores: Scores = {};
    evaluationCriteria[evaluationType].forEach((criteria) => {
      initialScores[criteria.id] = 0;
    });
    
    // Use existing scores if available
    if (evaluationType === 'department' && project.deptEvaluation?.completed) {
      setComments(project.deptEvaluation.feedback || '');
      
      // If detailed criteria scoring is available
      const deptCriteria = project.deptEvaluation?.criteria;
      if (deptCriteria) {
        Object.keys(deptCriteria).forEach(key => {
          initialScores[key] = deptCriteria[key] || 0;
        });
      } else {
        // Distribute the score evenly if no detailed scoring is available
        const totalMaxScore = evaluationCriteria.department.reduce((sum, criteria) => sum + criteria.maxScore, 0);
        const totalScore = project.deptEvaluation?.score || 0;
        
        evaluationCriteria.department.forEach(criteria => {
          const proportion = criteria.maxScore / totalMaxScore;
          initialScores[criteria.id] = Math.round(totalScore * proportion);
        });
      }
    } else if (evaluationType === 'central' && project.centralEvaluation?.completed) {
      setComments(project.centralEvaluation.feedback || '');
      
      // If detailed criteria scoring is available
      const centralCriteria = project.centralEvaluation?.criteria;
      if (centralCriteria) {
        Object.keys(centralCriteria).forEach(key => {
          initialScores[key] = centralCriteria[key] || 0;
        });
      } else {
        // Distribute the score evenly if no detailed scoring is available
        const totalMaxScore = evaluationCriteria.central.reduce((sum, criteria) => sum + criteria.maxScore, 0);
        const totalScore = project.centralEvaluation?.score || 0;
        
        evaluationCriteria.central.forEach(criteria => {
          const proportion = criteria.maxScore / totalMaxScore;
          initialScores[criteria.id] = Math.round(totalScore * proportion);
        });
      }
    } else {
      setComments('');
    }
    
    setScores(initialScores);
  };

  // Handle scoring change
  const handleScoreChange = (criteriaId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: parseInt(value)
    }));
  };

  // Calculate total score for current evaluation
  const calculateTotalScore = (): { current: number; max: number; percentage: number } => {
    if (!currentProject) return { current: 0, max: 0, percentage: 0 };
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = evaluationCriteria[evaluationType].reduce((sum, criteria) => sum + criteria.maxScore, 0);
    
    return {
      current: totalScore,
      max: maxPossibleScore,
      percentage: Math.round((totalScore / maxPossibleScore) * 100)
    };
  };

  // Submit evaluation
  const submitEvaluation = async () => {
    if (!currentProject) return;
    
    try {
      setLoading(true);
      
      // Calculate total score
      const { current, max, percentage } = calculateTotalScore();
      
      // Prepare evaluation data
      const evaluationData: EvaluationData = {
        score: percentage,
        feedback: comments,
        criteria: scores
      };
      
      // Submit to the appropriate endpoint based on evaluation type
      if (evaluationType === 'department') {
        await projectService.evaluateProjectByDepartment(currentProject._id, evaluationData);
      } else {
        await projectService.evaluateProjectByCentral(currentProject._id, evaluationData);
      }
      
      toast.success('Evaluation submitted successfully');
      
      // Refresh project data
      await fetchProjects();
      
      // Return to list view
      setViewMode('list');
      setCurrentProject(null);
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      toast.error('Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between department and central jury views
  const toggleEvaluationType = () => {
    if (viewMode === 'evaluate') {
      // If in evaluation mode, ask for confirmation before switching
      if (window.confirm('Switching evaluation type will discard unsaved changes. Continue?')) {
        setEvaluationType(evaluationType === 'department' ? 'central' : 'department');
        setViewMode('list');
        setCurrentProject(null);
      }
    } else {
      setEvaluationType(evaluationType === 'department' ? 'central' : 'department');
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
                <span className="font-medium">Status:</span>
                <select className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs">
                  <option value="all">All Projects</option>
                  <option value="pending">Pending Evaluation</option>
                  <option value="completed">Evaluation Completed</option>
                </select>
              </div>
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                <Clock size={14} className="mr-1" />
                {evaluationType === 'department' ? '10:00 AM - 12:00 PM' : '2:00 PM - 4:00 PM'}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">Loading projects...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <>
                {/* Project cards */}
                <div className="space-y-4">
                  {activeTab === 'assigned' ? (
                    pendingProjects.length > 0 ? pendingProjects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200">
                          <div>
                            <span className="text-xs font-medium text-gray-500">{project._id}</span>
                            <h3 className="font-medium text-lg">{project.title}</h3>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => startEvaluation(project)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Start Evaluation
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-500 block">Department</span>
                              <span className="text-sm font-medium">
                                {typeof project.department === 'object' ? (project.department as any).name : project.department}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Category</span>
                              <span className="text-sm font-medium">{project.category}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Location</span>
                              <span className="text-sm font-medium">
                                {project.locationId ? 
                                  (typeof project.locationId === 'object' ? (project.locationId as any).locationId : project.locationId) 
                                  : 'Not Assigned'}
                              </span>
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
                              <span className="text-sm text-gray-600">
                                {typeof project.team === 'object' ? (project.team as any).name : project.team}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        No pending projects found.
                      </div>
                    )
                  ) : (
                    evaluatedProjects.length > 0 ? evaluatedProjects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200">
                          <div>
                            <span className="text-xs font-medium text-gray-500">{project._id}</span>
                            <h3 className="font-medium text-lg">{project.title}</h3>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                              <CheckCircle size={14} className="mr-1" />
                              <span className="text-xs font-medium">
                                {evaluationType === 'department' ? 
                                  (project.deptEvaluation?.score || 0) : 
                                  (project.centralEvaluation?.score || 0)}%
                              </span>
                            </div>
                            <button
                              onClick={() => startEvaluation(project)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Evaluation
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-500 block">Department</span>
                              <span className="text-sm font-medium">
                                {typeof project.department === 'object' ? (project.department as any).name : project.department}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Category</span>
                              <span className="text-sm font-medium">{project.category}</span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block">Location</span>
                              <span className="text-sm font-medium">
                                {project.locationId ? 
                                  (typeof project.locationId === 'object' ? (project.locationId as any).locationId : project.locationId) 
                                  : 'Not Assigned'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <span className="text-xs text-gray-500 block">Feedback</span>
                            <p className="text-sm text-gray-700">
                              {evaluationType === 'department' ? 
                                (project.deptEvaluation?.feedback || 'No feedback provided.') : 
                                (project.centralEvaluation?.feedback || 'No feedback provided.')}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-2">
                                <User size={14} />
                              </div>
                              <span className="text-sm text-gray-600">
                                {typeof project.team === 'object' ? (project.team as any).name : project.team}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        No evaluated projects found.
                      </div>
                    )
                  )}
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
                        <div className="text-2xl font-bold text-green-600">{evaluatedProjects.length}</div>
                        <div className="text-sm text-gray-600">Evaluated</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{pendingProjects.length}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-2xl font-bold">{evaluatedProjects.length + pendingProjects.length}</div>
                        <div className="text-sm text-gray-600">Total Assigned</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                    <span className="text-xs text-gray-500">{currentProject._id}</span>
                    <h3 className="text-xl font-semibold mb-2">{currentProject.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeof currentProject.department === 'object' ? (currentProject.department as any).name : currentProject.department}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {currentProject.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentProject.locationId ? 
                          (typeof currentProject.locationId === 'object' ? (currentProject.locationId as any).locationId : currentProject.locationId) 
                          : 'No Location'}
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
                  <span>{typeof currentProject.team === 'object' ? (currentProject.team as any).name : currentProject.team}</span>
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
                  <div className="text-2xl font-bold">{calculateTotalScore().current}</div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-2xl font-bold">{calculateTotalScore().max}</div>
                  <div className="text-sm text-gray-600">Maximum Possible</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-2xl font-bold">{calculateTotalScore().percentage}%</div>
                  <div className="text-sm text-gray-600">Percentage</div>
                </div>
              </div>
              
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${calculateTotalScore().percentage}%` }}
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
                disabled={loading || calculateTotalScore().current === 0}
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
