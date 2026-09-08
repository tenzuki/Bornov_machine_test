import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../config/tasks';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Task title must be at least 2 characters').trim(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
    dueDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional().nullable(),
    projectId: z.string().uuid('Invalid project ID'),
    assignedToId: z.string().uuid('Invalid assigned user ID').optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(2, 'Task title must be at least 2 characters').trim().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional().nullable(),
    projectId: z.string().uuid('Invalid project ID').optional(),
    assignedToId: z.string().uuid('Invalid assigned user ID').optional().nullable(),
  }),
});

export const getTaskParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    projectId: z.string().uuid().optional(),
    assignedToId: z.string().uuid().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'title', 'priority', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
