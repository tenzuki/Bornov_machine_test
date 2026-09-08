import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';
import { Role } from '../config/roles';

export const checkProjectAccess = (action: 'READ' | 'MANAGE' | 'DELETE') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const projectId = req.params.id || req.params.projectId || req.body.projectId;

    if (!userId || !userRole) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!projectId) {
      throw AppError.badRequest('Project ID is required');
    }

    // ADMIN has bypass access
    if (userRole === Role.ADMIN) {
      return next();
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, createdById: true },
    });

    if (!project) {
      throw AppError.notFound('Project not found');
    }

    const isCreator = project.createdById === userId;

    if (action === 'DELETE') {
      if (!isCreator) {
        throw AppError.forbidden('Only the project creator or an ADMIN can delete this project');
      }
      return next();
    }

    if (action === 'MANAGE') {
      if (!isCreator && userRole !== Role.MANAGER) {
        throw AppError.forbidden('Only the project creator or an authorized manager can modify this project');
      }
      return next();
    }

    // READ access check
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!isCreator && !membership) {
      throw AppError.forbidden('You are not a member of this project');
    }

    next();
  });
};

export const checkTaskAccess = (action: 'READ' | 'UPDATE' | 'DELETE') => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const taskId = req.params.id;

    if (!userId || !userRole) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!taskId) {
      throw AppError.badRequest('Task ID is required');
    }

    if (userRole === Role.ADMIN) {
      return next();
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, createdById: true, assignedToId: true, projectId: true },
    });

    if (!task) {
      throw AppError.notFound('Task not found');
    }

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      select: { createdById: true },
    });

    const isTaskCreator = task.createdById === userId;
    const isAssignee = task.assignedToId === userId;
    const isProjectCreator = project?.createdById === userId;

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId,
        },
      },
    });

    if (action === 'READ') {
      if (!isTaskCreator && !isAssignee && !isProjectCreator && !membership) {
        throw AppError.forbidden('You do not have access to view this task');
      }
      return next();
    }

    if (action === 'DELETE') {
      if (!isTaskCreator && !isProjectCreator) {
        throw AppError.forbidden('Only the task creator or project manager can delete this task');
      }
      return next();
    }

    if (action === 'UPDATE') {
      // If user is assignee, they can update task status
      if (!isTaskCreator && !isProjectCreator && !isAssignee && !membership) {
        throw AppError.forbidden('You do not have permission to update this task');
      }
      return next();
    }

    next();
  });
};
