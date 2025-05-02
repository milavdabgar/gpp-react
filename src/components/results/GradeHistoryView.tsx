import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Book, Check, X, Award, Info, BarChart2, ExternalLink } from 'lucide-react';
import { resultApi } from '../../services/api';
import { Result, Subject } from '../../types/result';
import { useToast } from '../../context/ToastContext';
import DetailedResultView from './DetailedResultView';

interface GradeHistoryViewProps {
  studentId: string;
  enrollmentNo?: string;
  onClose?: () => void;
}

const GradeHistoryView: React.FC<GradeHistoryViewProps> = ({ studentId, enrollmentNo, onClose }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (studentId || enrollmentNo) {
      fetchStudentResults();
    }
  }, [studentId, enrollmentNo]);

  const fetchStudentResults = async () => {
    setIsLoading(true);
    try {
      const response = await resultApi.getStudentResults(studentId) as { data: { results: Result[] } };
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching student results:', error);
      showToast('Failed to load student results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate grade points
  const getGradePoint = (grade: string): number => {
    const gradePoints: Record<string, number> = {
      'AA': 10,
      'AB': 9,
      'BB': 8,
      'BC': 7,
      'CC': 6,
      'CD': 5,
      'DD': 4,
      'FF': 0,
      'II': 0
    };
    return gradePoints[grade] || 0;
  };

  // Get color class based on grade
  const getGradeColorClass = (grade: string): string => {
    if (grade === 'AA' || grade === 'AB') {
      return 'bg-green-100 text-green-800';
    } else if (grade === 'BB' || grade === 'BC') {
      return 'bg-blue-100 text-blue-800';
    } else if (grade === 'CC' || grade === 'CD') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (grade === 'DD') {
      return 'bg-orange-100 text-orange-800';
    } else if (grade === 'FF' || grade === 'II') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Group results by semester
  const resultsBySemester = results.reduce<Record<number, Result[]>>((acc, result) => {
    if (!acc[result.semester]) {
      acc[result.semester] = [];
    }
    acc[result.semester].push(result);
    return acc;
  }, {});

  // Sort semesters
  const sortedSemesters = Object.keys(resultsBySemester)
    .map(Number)
    .sort((a, b) => a - b);

  // Get latest CPI
  const getLatestCPI = (): number => {
    if (results.length === 0) return 0;
    
    // Sort by declaration date (newest first)
    const sortedResults = [...results].sort(
      (a, b) => new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime()
    );
    
    return sortedResults[0].cpi;
  };

  // Get total credits earned
  const getTotalCreditsEarned = (): number => {
    return results.reduce((total, result) => total + result.earnedCredits, 0);
  };

  // View detailed result
  const viewDetailedResult = (resultId: string) => {
    setSelectedResult(resultId);
    setShowDetailedView(true);
  };

  // Close detailed view
  const closeDetailedView = () => {
    setShowDetailedView(false);
    setSelectedResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-gray-800 font-medium">No Results Found</h3>
        <p className="text-gray-500 mt-1">
          No examination results are available for this student yet.
        </p>
      </div>
    );
  }

  if (showDetailedView && selectedResult) {
    return (
      <DetailedResultView 
        resultId={selectedResult} 
        onClose={closeDetailedView} 
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with actions */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Grade History</h2>
        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Academic Performance Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-700">Current CPI</div>
              <div className="text-3xl font-bold text-blue-800">{getLatestCPI().toFixed(2)}</div>
              <div className="text-xs text-blue-600 mt-1">Cumulative Performance Index</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-700">Total Credits Earned</div>
              <div className="text-3xl font-bold text-green-800">{getTotalCreditsEarned()}</div>
              <div className="text-xs text-green-600 mt-1">Out of available credits</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-purple-700">Semesters Completed</div>
              <div className="text-3xl font-bold text-purple-800">{sortedSemesters.length}</div>
              <div className="text-xs text-purple-600 mt-1">Total academic terms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester-wise Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Semester-wise Results</h2>
        
        {sortedSemesters.map((semester) => {
          const semesterResults = resultsBySemester[semester];
          // Sort by declaration date (newest first)
          const sortedSemResults = [...semesterResults].sort(
            (a, b) => new Date(b.declarationDate).getTime() - new Date(a.declarationDate).getTime()
          );
          
          return (
            <div key={semester} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Semester {semester}</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {sortedSemResults.map((result) => (
                  <div key={result._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{result.exam}</div>
                        <div className="text-sm text-gray-500">
                          {result.academicYear} • {new Date(result.declarationDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">SPI:</span>
                            <span className="font-semibold">{result.spi.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">CPI:</span>
                            <span className="font-semibold">{result.cpi.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.result}
                        </span>
                        
                        <button
                          onClick={() => viewDetailedResult(result._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Subject Overview */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.subjects.map((subject, idx) => (
                        <div 
                          key={idx} 
                          className={`px-2 py-1 rounded-md text-xs ${
                            subject.isBacklog ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                          }`}
                          title={`${subject.name} (${subject.code})`}
                        >
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.grade)} mr-1`}>
                            {subject.grade}
                          </span>
                          {subject.code}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="font-semibold">Performance Trends</h3>
        </div>
        
        <div className="p-6">
          <div className="h-64 flex items-center justify-center">
            {/* This would be where a chart component would go */}
            <div className="text-center text-gray-500">
              <p>Performance trend visualization would be displayed here.</p>
              <p className="text-sm">Showing SPI and CPI progression across semesters</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GradeHistoryView;
