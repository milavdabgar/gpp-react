import React, { useState, useEffect } from 'react';
import { Clock, User, Check, Filter, CheckCircle, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as projectService from '../../services/project.service';

const JuryEvaluation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [evaluationType, setEvaluationType] = useState('department');
  const [currentProject, setCurrentProject] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for projects data
  const [evaluatedProjects, setEvaluatedProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  
  // State for evaluation
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  
  // Evaluation criteria based on jury type
  const evaluationCriteria = {
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

  // Fetch projects for jury
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getProjectsForJury(evaluationType);
      const { evaluatedProjects, pendingProjects } = response.data;
      
      setEvaluatedProjects(evaluatedProjects);
      setPendingProjects(pendingProjects);
    } catch (err) {
      setError('Failed to fetch projects. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Load projects on initial render and when evaluation type changes
  useEffect(() => {
    fetchProjects();
  }, [evaluationType]);
  
  // Start evaluating a project
  const startEvaluation = (project) => {
    setCurrentProject(project);
    setViewMode('evaluate');
    
    // Initialize scores
    const initialScores = {};
    evaluationCriteria[evaluationType].forEach((criteria) => {
      initialScores[criteria.id] = 0;
    });
    setScores(initialScores);
    setComments('');
  };
  
  // Handle scoring change
  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: parseInt(value)
    }));
  };
  
  // Calculate total score for current evaluation
  const calculateTotalScore = () => {
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
    
    setLoading(true);
    setError(null);
    
    try {
      const totalScore = calculateTotalScore();
      const evaluationData = {
        score: totalScore.percentage,
        feedback: comments,
        detailedScores: scores
      };
      
      if (evaluationType === 'department') {
        await projectService.evaluateProjectByDepartment(currentProject._id, evaluationData);
      } else {
        await projectService.evaluateProjectByCentral(currentProject._id, evaluationData);
      }
      
      // Refresh projects list
      await fetchProjects();
      
      // Reset state and go back to list view
      setViewMode('list');
      setCurrentProject(null);
    } catch (err) {
      setError('Failed to submit evaluation. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between department and central jury views
  const toggleEvaluationType = () => {
    const newType = evaluationType === 'department' ? 'central' : 'department';
    setEvaluationType(newType);
    
    if (viewMode === 'evaluate') {
      setViewMode('list');
      setCurrentProject(null);
    }
  };
  
  // Filter projects by department/category
  const filterProjects = async (e) => {
    // In a real implementation, you would update the filter and re-fetch
    console.log('Filtering by:', e.target.value);
  };
  
  // Render projects list based on the active tab
  const renderProjects = () => {
    const projects = activeTab === 'assigned' ? pendingProjects : evaluatedProjects;
    
    if (loading && projects.length === 0) {
      return <div className="p-4 text-center">Loading projects...</div>;
    }
    
    if (error) {
      return <div className="p-4 text-center text-red-500">{error}</div>;
    }
    
    if (projects.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          {activeTab === 'assigned' 
            ? 'No pending projects to evaluate.' 
            : 'No projects have been evaluated yet.'}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project._id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-200">
              <div>
                <span className="text-xs font-medium text-gray-500">{project._id}</span>
                <h3 className="font-medium text-lg">{project.title}</h3>
              </div>
              <div className="flex items-center">
                {activeTab === 'evaluated' && (
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                    <CheckCircle size={14} className="mr-1" />
                    <span className="text-xs font-medium">
                      {evaluationType === 'department' 
                        ? project.deptEvaluation.score + '%' 
                        : project.centralEvaluation.score + '%'}
                    </span>
                  </div>
                )}
                
                {activeTab === 'assigned' && (
                  <button
                    onClick={() => startEvaluation(project)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    disabled={loading}
                  >
                    Start Evaluation
                  </button>
                )}
                
                {activeTab === 'evaluated' && (
                  <button
                    onClick={() => startEvaluation(project)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Evaluation
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500 block">Department</span>
                  <span className="text-sm font-medium">
                    {project.department?.name || 'Unknown Department'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Category</span>
                  <span className="text-sm font-medium">{project.category}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Location</span>
                  <span className="text-sm font-medium">
                    {project.locationId?.locationId || 'Not Assigned'}
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
                    {project.teamId?.name || 'Unknown Team'} 
                    ({project.teamId?.members?.length || 0} members)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
          disabled={loading}
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
                <select 
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs"
                  onChange={filterProjects}
                >
                  <option value="">All Departments</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
                <select 
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs"
                  onChange={filterProjects}
                >
                  <option value="">All Categories</option>
                  <option value="IoT & Smart Systems">IoT & Smart Systems</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Hardware Project">Hardware Project</option>
                </select>
              </div>
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center">
                <Clock size={14} className="mr-1" />
                {evaluationType === 'department' ? '10:00 AM - 12:00 PM' : '2:00 PM - 4:00 PM'}
              </div>
            </div>
            
            {/* Projects list */}
            {renderProjects()}
            
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
                        {currentProject.department?.name || 'Unknown Department'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {currentProject.category}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentProject.locationId?.locationId || 'Not Assigned'}
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
                  <span>
                    {currentProject.teamId?.name || 'Unknown Team'} 
                    ({currentProject.teamId?.members?.length || 0} members)
                  </span>
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
                        disabled={loading}
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
                disabled={loading}
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
                {`${calculateTotalScore().current} out of ${calculateTotalScore().max} points`}
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
                disabled={loading}
              >
                Cancel & Return
              </button>
              <button
                onClick={submitEvaluation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={loading || activeTab === 'evaluated'}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    Submit Evaluation
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JuryEvaluation;