import api from './api';
import {
  Result,
  ResultFilterParams,
  ResultsResponse,
  ResultDetailResponse,
  BatchesResponse,
  ResultImportResponse,
  ResultDeleteBatchResponse,
  AnalysisResponse
} from '../types/result';

export const resultApi = {
  // Get all results with optional filtering
  getAllResults: async (params: ResultFilterParams = {}): Promise<ResultsResponse> => {
    const response = await api.get<ResultsResponse>('/results', { params });
    return response.data;
  },

  // Get a single result by ID
  getResult: async (id: string): Promise<ResultDetailResponse> => {
    const response = await api.get<ResultDetailResponse>(`/results/${id}`);
    return response.data;
  },

  // Get all results for a specific student
  getStudentResults: async (studentId: string): Promise<ResultsResponse> => {
    const response = await api.get<ResultsResponse>(`/results/student/${studentId}`);
    return response.data;
  },

  // Get recent upload batches
  getUploadBatches: async (): Promise<BatchesResponse> => {
    const response = await api.get<BatchesResponse>('/results/batches');
    return response.data;
  },

  // Import results from a CSV file
  importResults: async (formData: FormData): Promise<ResultImportResponse> => {
    const response = await api.post<ResultImportResponse>('/results/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export results to CSV with optional filtering
  exportResults: async (params: ResultFilterParams = {}) => {
    const response = await api.get('/results/export', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  // Delete a result by ID
  deleteResult: async (id: string) => {
    const response = await api.delete(`/results/${id}`);
    return response.data;
  },

  // Delete all results in a batch
  deleteResultsByBatch: async (batchId: string): Promise<ResultDeleteBatchResponse> => {
    const response = await api.delete<ResultDeleteBatchResponse>(`/results/batch/${batchId}`);
    return response.data;
  },

  // Get branch-wise analysis
  getBranchAnalysis: async (params: {
    academicYear?: string;
    examid?: number;
  } = {}): Promise<AnalysisResponse> => {
    const response = await api.get<AnalysisResponse>('/results/analysis', { params });
    return response.data;
  }
};

export default resultApi;