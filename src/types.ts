export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  deadline: Date;
  preSubmissionDate?: Date;
  hasInfoSession: boolean;
  requiresRegistration: boolean;
  priority: Priority;
  status: Status;
  source: string;
}

export type Category = 'Legal' | 'Administrative' | 'Financial' | 'Regulatory' | 'Other';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';