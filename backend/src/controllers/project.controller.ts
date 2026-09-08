import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { asyncHandler } from '../utils/async-handler';
import { RoleType } from '../config/roles';

export class ProjectController {
  getProjects = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, sortBy, sortOrder } = req.query as any;

    const result = await projectService.getProjects({
      userId: req.user!.userId,
      userRole: req.user!.role as RoleType,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      search: search as string,
      sortBy: (sortBy as any) || 'createdAt',
      sortOrder: (sortOrder as any) || 'desc',
    });

    res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination,
    });
  });

  getProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.getProjectById(req.params.id);

    res.status(200).json({
      success: true,
      data: { project },
    });
  });

  createProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.createProject(req.body, req.user!.userId);

    res.status(201).json({
      success: true,
      data: { project },
      message: 'Project created successfully',
    });
  });

  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.updateProject(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: { project },
      message: 'Project updated successfully',
    });
  });

  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await projectService.deleteProject(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  addMember = asyncHandler(async (req: Request, res: Response) => {
    const member = await projectService.addMember(req.params.id, req.body.userId);

    res.status(201).json({
      success: true,
      data: { member },
      message: 'Member added to project successfully',
    });
  });

  removeMember = asyncHandler(async (req: Request, res: Response) => {
    await projectService.removeMember(req.params.id, req.params.userId);

    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully',
    });
  });

  getMembers = asyncHandler(async (req: Request, res: Response) => {
    const members = await projectService.getMembers(req.params.id);

    res.status(200).json({
      success: true,
      data: { members },
    });
  });
}

export const projectController = new ProjectController();
