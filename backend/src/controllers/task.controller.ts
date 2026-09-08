import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { asyncHandler } from '../utils/async-handler';
import { RoleType } from '../config/roles';

export class TaskController {
  getTasks = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, status, priority, projectId, assignedToId, sortBy, sortOrder } = req.query as any;

    const result = await taskService.getTasks({
      userId: req.user!.userId,
      userRole: req.user!.role as RoleType,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      search: search as string,
      status: status as any,
      priority: priority as any,
      projectId: projectId as string,
      assignedToId: assignedToId as string,
      sortBy: (sortBy as any) || 'createdAt',
      sortOrder: (sortOrder as any) || 'desc',
    });

    res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  });

  getTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.getTaskById(req.params.id);

    res.status(200).json({
      success: true,
      data: { task },
    });
  });

  createTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.createTask(req.body, req.user!.userId, req.user!.role as RoleType);

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully',
    });
  });

  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.updateTask(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: { task },
      message: 'Task updated successfully',
    });
  });

  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    await taskService.deleteTask(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  });
}

export const taskController = new TaskController();
