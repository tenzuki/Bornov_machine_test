import { taskRepository, TaskQueryOptions } from '../repositories/task.repository';
import { projectRepository } from '../repositories/project.repository';
import { userRepository } from '../repositories/user.repository';
import { projectMemberRepository } from '../repositories/project-member.repository';
import { AppError } from '../utils/app-error';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { Role } from '../config/roles';

export class TaskService {
  async getTasks(options: TaskQueryOptions) {
    const { tasks, totalRecords } = await taskRepository.findMany(options);
    const totalPages = Math.ceil(totalRecords / options.limit) || 1;

    return {
      tasks,
      pagination: {
        page: options.page,
        limit: options.limit,
        totalRecords,
        totalPages,
        hasNextPage: options.page < totalPages,
        hasPrevPage: options.page > 1,
      },
    };
  }

  async getTaskById(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }
    return task;
  }

  async createTask(input: CreateTaskInput, createdById: string, userRole: string) {
    const project = await projectRepository.findById(input.projectId);
    if (!project) {
      throw AppError.notFound('Target project does not exist');
    }

    // Non-admin user must be project creator or member to create tasks in this project
    if (userRole !== Role.ADMIN) {
      const isCreator = project.createdById === createdById;
      const membership = await projectMemberRepository.findMembership(input.projectId, createdById);
      if (!isCreator && !membership) {
        throw AppError.forbidden('You must be a member of the project to create tasks');
      }
    }

    if (input.assignedToId) {
      const assignedUser = await userRepository.findById(input.assignedToId);
      if (!assignedUser) {
        throw AppError.notFound('Assigned user does not exist');
      }
    }

    return taskRepository.create({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      projectId: input.projectId,
      assignedToId: input.assignedToId,
      createdById,
    });
  }

  async updateTask(id: string, input: UpdateTaskInput) {
    const task = await this.getTaskById(id);

    if (input.assignedToId) {
      const assignedUser = await userRepository.findById(input.assignedToId);
      if (!assignedUser) {
        throw AppError.notFound('Assigned user does not exist');
      }
    }

    const updateData: any = { ...input };
    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    return taskRepository.update(task.id, updateData);
  }

  async deleteTask(id: string) {
    await this.getTaskById(id);
    await taskRepository.delete(id);
  }
}

export const taskService = new TaskService();
