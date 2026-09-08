import { prisma } from '../config/database';
import { Task } from '@prisma/client';
import { Role } from '../config/roles';
import { TaskStatusType, TaskPriorityType } from '../config/tasks';

export interface TaskQueryOptions {
  userId: string;
  userRole: string;
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  projectId?: string;
  assignedToId?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
}

export class TaskRepository {
  async findMany(options: TaskQueryOptions) {
    const { userId, userRole, page, limit, search, status, priority, projectId, assignedToId, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      AND: [],
    };

    // Scoping for non-ADMIN users: can only view tasks of projects they belong to or created
    if (userRole !== Role.ADMIN) {
      whereClause.AND.push({
        project: {
          OR: [
            { createdById: userId },
            { members: { some: { userId } } },
          ],
        },
      });
    }

    if (status) whereClause.AND.push({ status });
    if (priority) whereClause.AND.push({ priority });
    if (projectId) whereClause.AND.push({ projectId });
    if (assignedToId) whereClause.AND.push({ assignedToId });

    if (search) {
      whereClause.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      });
    }

    // Clean empty AND array if not needed
    if (whereClause.AND.length === 0) delete whereClause.AND;

    const [tasks, totalRecords] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.task.count({ where: whereClause }),
    ]);

    return { tasks, totalRecords };
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, createdById: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    status?: TaskStatusType;
    priority?: TaskPriorityType;
    dueDate?: Date | null;
    projectId: string;
    assignedToId?: string | null;
    createdById: string;
  }): Promise<Task> {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId: data.projectId,
        assignedToId: data.assignedToId,
        createdById: data.createdById,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }
}

export const taskRepository = new TaskRepository();
