export interface IFaculty {
  _id?: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  designation: string;
  specializations: string[];
  qualifications: string[];
  joiningDate: Date;
  status: 'active' | 'inactive';
  experience: {
    years: number;
    details: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
