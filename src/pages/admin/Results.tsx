import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Download, Upload, Trash2, Search, Filter, Info, FileText, ExternalLink, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { resultApi } from '../../services/api';
import type { Result, UploadBatch, BranchAnalysis, ResultsResponse, BatchesResponse, ResultImportResponse, ResultDeleteBatchResponse, AnalysisResponse, Pagination } from '../../types/result';
import DetailedResultView from '../../components/results/DetailedResultView';
import GradeHistoryView from '../../components/results/GradeHistoryView';

const Results = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'results' | 'batches' | 'analysis' | 'detailedView' | 'historyView'>('results');
  const [results, setResults] = useState<Result[]>([]);
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [branchAnalysis, setBranchAnalysis] = useState<BranchAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    branchName: '',
    semester: '',
    academicYear: '',
    examid: '',
    uploadBatch: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    pages: 1
  });
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load initial data based on active tab
  useEffect(() => {
    if (activeTab === 'results') {
      fetchResults();
    } else if (activeTab === 'batches') {
      fetchBatches();
    } else if (activeTab === 'analysis') {
      fetchBranchAnalysis();
    }
  }, [activeTab]);

  // Fetch results with pagination and filters
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        }, {} as any)
      };

      const response = await resultApi.getAllResults(params) as ResultsResponse;
      setResults(response.data.results);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      showToast('Failed to fetch results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch upload batches
  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await resultApi.getUploadBatches() as BatchesResponse;
      setBatches(response.data.batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
      showToast('Failed to fetch upload batches', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branch analysis
  const fetchBranchAnalysis = async () => {
    setIsLoading(true);
    try {
      const params = {
        academicYear: filters.academicYear || undefined,
        examid: filters.examid ? parseInt(filters.examid) : undefined
      };

      const response = await resultApi.getBranchAnalysis(params) as AnalysisResponse;
      setBranchAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error fetching branch analysis:', error);
      showToast('Failed to fetch branch analysis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchResults();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchResults();
  };

  // Import Results
  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const response = await resultApi.importResults(formData) as ResultImportResponse;
      
      if (response.data.importedCount === 0) {
        showToast(`No new results were imported - these results appear to have already been uploaded previously. Try uploading different results or check that you selected the correct file.`, 'warning');
      } else {
        showToast(`Successfully imported ${response.data.importedCount} results`, 'success');
      }

      // Refresh both results and batches
      await fetchResults();
      await fetchBatches();
    } catch (error: any) {
      console.error('Error importing results:', error);
      showToast(error.response?.data?.message || 'Failed to import results', 'error');
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Export Results
  const handleExportCsv = async () => {
    try {
      setIsLoading(true);

      const params = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const response = await resultApi.exportResults(params);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Results exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting results:', error);
      showToast('Failed to export results', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete batch
  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;

    try {
      setIsLoading(true);
      const response = await resultApi.deleteResultsByBatch(selectedBatch) as ResultDeleteBatchResponse;
      
      showToast(`Successfully deleted ${response.data.deletedCount} results`, 'success');
      
      // Refresh batches and results
      await fetchBatches();
      await fetchResults();

      // Close confirmation modal
      setShowDeleteConfirm(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error('Error deleting batch:', error);
      showToast('Failed to delete batch', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter results by search term
  const filteredResults = results.filter(result => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      result.st_id.toLowerCase().includes(searchTermLower) ||
      result.name.toLowerCase().includes(searchTermLower) ||
      result.branchName.toLowerCase().includes(searchTermLower) ||
      result.exam.toLowerCase().includes(searchTermLower)
    );
  });

  // Render detailed result view
  const renderDetailedView = () => {
    if (!selectedResult) return null;
    
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setActiveTab('results');
              setSelectedResult(null);
            }}
            className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronUp className="h-4 w-4 mr-1 rotate-90" />
            Back to Results
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detailed Result View</h1>
        </div>
        <DetailedResultView resultId={selectedResult} />
      </div>
    );
  };

  // Render student grade history view
  const renderGradeHistoryView = () => {
    if (!selectedStudent) return null;
    
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setActiveTab('results');
              setSelectedStudent(null);
            }}
            className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChevronUp className="h-4 w-4 mr-1 rotate-90" />
            Back to Results
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Grade History</h1>
        </div>
        <GradeHistoryView studentId={selectedStudent} />
      </div>
    );
  };

  // Render results tab
  const renderResultsTab = () => {
    return (
      <>
        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by ID, name, branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <select
              name="branchName"
              value={filters.branchName}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md min-w-[180px]"
            >
              <option value="">All Branches</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>

            <select
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md min-w-[120px]"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <input
              type="text"
              name="academicYear"
              placeholder="Academic Year"
              value={filters.academicYear}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md w-40"
            />

            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Filter className="h-4 w-4 inline mr-1" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading results...</p>
                    </td>
                  </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">No results found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or import results</p>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(result => (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.st_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{result.name}</span>
                          <button 
                            onClick={() => {
                              setSelectedStudent(result.st_id);
                              setActiveTab('historyView');
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="View student grade history"
                          >
                            <User className="h-4 w-4 text-blue-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.branchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.exam}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.spi.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.cpi.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.result}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedResult(result._id);
                              setActiveTab('detailedView');
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="View detailed result"
                          >
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredResults.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 border rounded-md ${pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 py-1 border rounded-md ${pagination.page === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render batches tab
  const renderBatchesTab = () => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upload Batches</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage result upload batches. Each batch represents a single CSV import.
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No upload batches found</p>
            <p className="text-sm text-gray-400">Import results to create upload batches</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {batches.map((batch) => (
              <li key={batch._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{batch._id}</div>
                    <div className="text-sm text-gray-500">
                      {batch.count} results • Last upload: {new Date(batch.latestUpload).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch._id);
                      setShowDeleteConfirm(true);
                    }}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Render analysis tab
  const renderAnalysisTab = () => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Branch Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            View performance analysis by branch and semester.
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading analysis...</p>
          </div>
        ) : branchAnalysis.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No analysis data available</p>
            <p className="text-sm text-gray-400">Import results to generate analysis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distinction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Second Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. SPI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {branchAnalysis.map((analysis) => (
                  <tr key={`${analysis._id.branchName}-${analysis._id.semester}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {analysis._id.branchName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analysis._id.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analysis.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${analysis.passPercentage}%` }}></div>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${analysis.passPercentage > 75
                          ? 'bg-green-100 text-green-800'
                          : analysis.passPercentage > 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {analysis.passPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analysis.distinctionCount} ({((analysis.distinctionCount / analysis.totalStudents) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analysis.firstClassCount} ({((analysis.firstClassCount / analysis.totalStudents) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {analysis.secondClassCount} ({((analysis.secondClassCount / analysis.totalStudents) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {analysis.avgSpi.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'detailedView') {
      return renderDetailedView();
    }
    
    if (activeTab === 'historyView') {
      return renderGradeHistoryView();
    }
    
    return (
      <>
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'batches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Upload Batches
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Result Analysis
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'results' && renderResultsTab()}
        {activeTab === 'batches' && renderBatchesTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </>
    );
  };

return (
<div className="container mx-auto px-4 py-8">
{activeTab !== 'detailedView' && activeTab !== 'historyView' && (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleExportCsv}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        disabled={isLoading}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
      <label htmlFor="csvUpload" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
        <Upload className="h-4 w-4 mr-2" />
        Import
      </label>
      <input
        id="csvUpload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImportCsv}
        disabled={isLoading}
      />
    </div>
  </div>
)}

{renderContent()}

{/* Delete Confirmation Modal */}
{showDeleteConfirm && (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      {/* Modal content */}
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Upload Batch
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this upload batch? This will permanently remove all {batches.find(b => b._id === selectedBatch)?.count} results associated with this batch.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={handleDeleteBatch}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(false);
              setSelectedBatch(null);
            }}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
);
};

export default Results;