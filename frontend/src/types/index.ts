export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}
