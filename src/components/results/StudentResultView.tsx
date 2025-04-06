import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Book, Check, X, Award, Info } from 'lucide-react';
import { resultApi } from '../../services/api';
import { Result, Subject, ResultsResponse } from '../../types/result';
import { useToast } from '../../context/ToastContext';

interface StudentResultViewProps {
  studentId: string;
}

const StudentResultView: React.FC<StudentResultViewProps> = ({ studentId }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await resultApi.getStudentResults(studentId) as ResultsResponse;
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching student results:', error);
      showToast('Failed to load results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (resultId: string) => {
    if (expandedResult === resultId) {
      setExpandedResult(null);
    } else {
      setExpandedResult(resultId);
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

  // Sort results by semester (ascending)
  const sortedResults = [...results].sort(
    (a, b) => a.semester - b.semester || b.declarationDate.localeCompare(a.declarationDate)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Academic Results</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : sortedResults.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-gray-800 font-medium">No Results Found</h3>
          <p className="text-gray-500 mt-1">
            No examination results are available for this student yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedResults.map((result) => (
            <div key={result._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div
                onClick={() => toggleExpand(result._id)}
                className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Semester {result.semester}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      result.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.result}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.exam} ({result.academicYear})
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">SPI: {result.spi.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">CPI: {result.cpi.toFixed(2)}</div>
                  </div>
                  {expandedResult === result._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedResult === result._id && (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Declaration Date</div>
                        <div>{new Date(result.declarationDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Attempt</div>
                        <div>{result.trials === 1 ? 'First Attempt' : `${result.trials} Attempts`}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Book size={16} className="mr-2" />
                    Subject Results
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject Name
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade Points
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Backlog
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.subjects.map((subject: Subject, index: number) => (
                          <tr key={index} className={subject.isBacklog ? 'bg-red-50' : ''}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {subject.code}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {subject.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                              {subject.credits}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                              {getGradePoint(subject.grade)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              {subject.isBacklog ? (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Total Credits</div>
                        <div className="font-medium">{result.totalCredits}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Earned Credits</div>
                        <div className="font-medium">{result.earnedCredits}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Backlogs</div>
                        <div className="font-medium">
                          {result.subjects.sort((a: Subject, b: Subject) => (a.isBacklog ? 1 : -1)).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.remark && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex">
                        <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Remark</div>
                          <div className="text-sm text-yellow-700">{result.remark}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResultView;
