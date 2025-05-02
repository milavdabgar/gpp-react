import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Book, Check, X, Award, Info, Download, Printer } from 'lucide-react';
import { resultApi } from '../../services/api';
import { Result, Subject } from '../../types/result';
import { useToast } from '../../context/ToastContext';
import GradeHistoryView from './GradeHistoryView';

interface DetailedResultViewProps {
  resultId: string;
  onClose?: () => void;
}

const DetailedResultView: React.FC<DetailedResultViewProps> = ({ resultId, onClose }) => {
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGradeHistory, setShowGradeHistory] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (resultId) {
      fetchResultDetails();
    }
  }, [resultId]);

  const fetchResultDetails = async () => {
    setIsLoading(true);
    try {
      const response = await resultApi.getResult(resultId) as { data: { result: Result } };
      setResult(response.data.result);
    } catch (error) {
      console.error('Error fetching result details:', error);
      showToast('Failed to load result details', 'error');
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

  // Print result
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-gray-800 font-medium">Result Not Found</h3>
        <p className="text-gray-500 mt-1">
          The requested examination result could not be found.
        </p>
      </div>
    );
  }

  if (showGradeHistory && result) {
    return (
      <GradeHistoryView 
        studentId={result.st_id}
        onClose={() => setShowGradeHistory(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none">
      {/* Header with actions */}
      <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center print:bg-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Examination Result</h2>
          <p className="text-sm text-gray-600 mt-1">
            {result.exam} ({result.academicYear})
          </p>
        </div>
        <div className="flex space-x-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </button>
          <button
            onClick={() => setShowGradeHistory(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Award className="h-4 w-4 mr-1" />
            Grade History
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Student Information */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500">Enrollment Number</div>
            <div className="font-medium">{result.st_id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Name</div>
            <div className="font-medium">{result.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Branch</div>
            <div className="font-medium">{result.branchName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Semester</div>
            <div className="font-medium">{result.semester}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Institute</div>
            <div className="font-medium">{result.instName} ({result.instcode})</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Declaration Date</div>
            <div className="font-medium">{new Date(result.declarationDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="p-6 border-b border-gray-200 bg-blue-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Result Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">SPI</div>
            <div className="text-2xl font-bold text-blue-600">{result.spi.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">CPI</div>
            <div className="text-2xl font-bold text-indigo-600">{result.cpi.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Current Backlog</div>
            <div className="text-2xl font-bold text-orange-600">{result.currentBacklog || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-500">Total Backlog</div>
            <div className="text-2xl font-bold text-red-600">{result.totalBacklog || 0}</div>
          </div>
        </div>

      </div>

      {/* Subject Results */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Book size={18} className="mr-2" />
          Subject Results
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th colSpan={3} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Theory Grade
                </th>
                <th colSpan={3} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Practical Grade
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject Grade
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
              <tr>
                <th colSpan={3}></th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Theory External (70 marks)">E</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Theory Mid-term/PA (30 marks)">M</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Theory Total (100 marks)">Total</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Practical Internal/PA (20 marks)">I</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Practical End Term Viva (30 marks)">V</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Practical Total (50 marks)">Total</th>
                <th colSpan={2}></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.subjects.map((subject: Subject, index: number) => (
                <tr key={index} className={subject.isBacklog ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {subject.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {subject.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    {subject.credits}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.theoryEseGrade || 'NA')}`}>
                      {subject.theoryEseGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.theoryPaGrade || 'NA')}`}>
                      {subject.theoryPaGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.theoryTotalGrade || 'NA')}`}>
                      {subject.theoryTotalGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.practicalPaGrade || 'NA')}`}>
                      {subject.practicalPaGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.practicalVivaGrade || 'NA')}`}>
                      {subject.practicalVivaGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.practicalTotalGrade || 'NA')}`}>
                      {subject.practicalTotalGrade || 'NA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColorClass(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {subject.isBacklog ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Passed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">


          {result.remark && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Remarks
              </h4>
              <div className="text-sm text-yellow-700">{result.remark}</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 print:hidden">
        This result was generated from the system on {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default DetailedResultView;
