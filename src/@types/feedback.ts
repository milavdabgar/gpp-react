export interface BranchScore {
  Branch: string;
  Score: number;
}

export interface FacultyScore {
  Faculty_Initial: string;
  [key: string]: string | number; // For Q1-Q12 scores
}

export interface SubjectScore {
  Subject_Code: string;
  Subject_ShortForm?: string;
  Score: number;
  [key: string]: string | number | undefined; // For Q1-Q12 scores
}

export interface SemesterScore {
  Branch: string;
  Sem: number;
  [key: string]: string | number; // For Q1-Q12 scores
}

export interface TermYearScore {
  Year: number;
  Term: string;
  [key: string]: string | number; // For Q1-Q12 scores
}

export interface AnalysisResult {
  branch_scores: BranchScore[];
  faculty_scores: FacultyScore[];
  subject_scores: SubjectScore[];
  semester_scores: SemesterScore[];
  term_year_scores: TermYearScore[];
}
