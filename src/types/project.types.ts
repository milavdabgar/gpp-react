export interface Project {
  _id: string;
  title: string;
  description: string;
  team: string | Team;
  department: string | { _id: string; name: string; code?: string };
  status: string;
  evaluated?: boolean;
  score?: number;
  feedback?: string;
  requirements?: {
    power: boolean;
    internet: boolean;
    specialSpace: boolean;
    otherRequirements?: string;
  };
  deptEvaluation?: {
    completed: boolean;
    score?: number;
    feedback?: string;
    juryId?: string;
    evaluatedAt?: string;
    criteria?: Record<string, number>;
  };
  centralEvaluation?: {
    completed: boolean;
    score?: number;
    feedback?: string;
    juryId?: string;
    evaluatedAt?: string;
    criteria?: Record<string, number>;
  };
  [key: string]: any;
}

export interface Team {
  _id: string;
  name: string;
  members: string[];
  leader: string;
  department: string;
  [key: string]: any;
}

export interface ProjectEvent {
  _id: string;
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  name: string;
  eventDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  isActive: boolean;
  academicYear: string;
  schedule: Array<{
    time: string;
    activity: string;
    location: string;
    coordinator: {
      userId: string;
      name: string;
    };
    notes: string;
  }>;
  departments: string[];
  publishResults: boolean;
  [key: string]: any;
}

export interface Location {
  _id: string;
  name: string;
  section: string;
  department: string;
  capacity: number;
  [key: string]: any;
}

export interface ProjectStatistics {
  total: number;
  evaluated: number;
  pending: number;
  averageScore: number;
  departmentWise: Record<string, number>;
}

export interface EvaluationData {
  score: number;
  feedback?: string;
  criteria?: Record<string, number>;
}

export interface CategoryCounts {
  [category: string]: number;
}

export interface Winner extends Project {
  rank: number;
  score: number;
}

export interface EmailData {
  recipients: string[];
  subject: string;
  template: string;
  attachments?: string[];
}
