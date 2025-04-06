import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Download, Upload, Trash2, Search, Filter, Info, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { resultApi } from '../../services/api';

interface UploadBatch {
  _id: string;
  count: number;
  latestUpload: string;
}

interface Result {
  _id: string;
  st_id: string;
  name: string;
  branchName: string;
  semester: number;
  academicYear: string;
  exam: string;
  examid: number;
  spi: number;
  cpi: number;
  result: string;
  uploadBatch: string;
  createdAt: string;
}

interface BranchAnalysis {
  _id: {
    branchName: string;
    semester: number;
  };
  totalStudents: number;
  passCount: number;
  distinctionCount: number;
  firstClassCount: number;
  secondClassCount: number;
  passPercentage: number;
  avgSpi: number;
  avgCpi: number;
}

const Results = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'results' | 'batches' | 'analysis'>('results');
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

      const response = await resultApi.getAllResults(params);
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
      const response = await resultApi.getUploadBatches();
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

      const response = await resultApi.getBranchAnalysis(params);
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
      const response = await resultApi.importResults(formData);
      showToast(`Successfully imported ${response.data.importedCount} results`, 'success');

      // Refresh both results and batches
      await fetchResults();
      await fetchBatches();
    } catch (error) {
      console.error('Error importing results:', error);
      showToast('Failed to import results', 'error');
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

      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'results.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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
      const response = await resultApi.deleteResultsByBatch(selectedBatch);
      showToast(`Successfully deleted ${response.data.deletedCount} results`, 'success');

      // Refresh both results and batches
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

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Results Tab */}
      {activeTab === 'results' && (
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
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                          {result.name}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {result.spi.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {result.cpi.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.result === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {result.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>

                      {/* Page buttons */}
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border ${pagination.page === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } text-sm font-medium`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.pages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Upload Batches Tab */}
      {activeTab === 'batches' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upload Batches</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage result upload batches. Each batch represents a single CSV import.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Results Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading batches...</p>
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">No upload batches found</p>
                      <p className="text-sm text-gray-400">Upload some result files to get started</p>
                    </td>
                  </tr>
                ) : (
                  batches.map(batch => (
                    <tr key={batch._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {batch._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {batch.count} results
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(batch.latestUpload).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setFilters(prev => ({ ...prev, uploadBatch: batch._id }));
                            setActiveTab('results');
                            setTimeout(() => {
                              applyFilters();
                            }, 0);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatch(batch._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <>
          {/* Analysis Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm font-medium text-gray-700">Filter Analysis By:</div>

              <input
                type="text"
                name="academicYear"
                placeholder="Academic Year"
                value={filters.academicYear}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-md w-40"
              />

              <input
                type="text"
                name="examid"
                placeholder="Exam ID"
                value={filters.examid}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-md w-40"
              />

              <button
                onClick={fetchBranchAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 inline mr-1" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Analysis Content */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Branch-wise Result Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">
                Summary of performance metrics by branch and semester
              </p>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading analysis...</p>
              </div>
            ) : branchAnalysis.length === 0 ? (
              <div className="p-6 text-center">
                <Info className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No analysis data available</p>
                <p className="text-sm text-gray-400">Try importing some results first</p>
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
                        Pass %
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
                    {branchAnalysis.map((analysis, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {analysis._id.branchName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {analysis._id.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {analysis.totalStudents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${analysis.passPercentage >= 80 ? 'bg-green-100 text-green-800' :
                                analysis.passPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
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
        </>
      )}

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