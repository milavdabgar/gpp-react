export interface Subject {
    code: string;
    name: string;
    credits: number;
    grade: string;
    isBacklog: boolean;
  }
  
  export interface Result {
    _id: string;
    st_id: string;
    extype: string;
    examid: number;
    exam: string;
    declarationDate: string;
    academicYear: string;
    semester: number;
    mapNumber: number;
    unitNo: number;
    examNumber: number;
    name: string;
    instcode: number;
    instName: string;
    courseName: string;
    branchCode: number;
    branchName: string;
    subjects: Subject[];
    totalCredits: number;
    earnedCredits: number;
    spi: number;
    cpi: number;
    cgpa: number;
    result: string;
    trials: number;
    remark: string;
    uploadBatch: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UploadBatch {
    _id: string;
    count: number;
    latestUpload: string;
  }
  
  export interface BranchAnalysis {
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
  
  export interface ResultFilterParams {
    branchName?: string;
    semester?: number;
    academicYear?: string;
    examid?: number;
    uploadBatch?: string;
    page?: number;
    limit?: number;
  }
  
  export interface ResultImportResponse {
    status: string;
    data: {
      batchId: string;
      importedCount: number;
      totalRows: number;
    };
  }
  
  export interface ResultDeleteBatchResponse {
    status: string;
    data: {
      deletedCount: number;
    };
  }
  
  export interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
  
  export interface ResultsResponse {
    status: string;
    data: {
      results: Result[];
      pagination?: Pagination;
    };
  }
  
  export interface ResultDetailResponse {
    status: string;
    data: {
      result: Result;
    };
  }
  
  export interface BatchesResponse {
    status: string;
    data: {
      batches: UploadBatch[];
    };
  }
  
  export interface AnalysisResponse {
    status: string;
    data: {
      analysis: BranchAnalysis[];
    };
  }