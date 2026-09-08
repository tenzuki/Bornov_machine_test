import { prisma } from '../config/database';
import { Project } from '@prisma/client';
import { Role } from '../config/roles';

export interface ProjectQueryOptions {
  userId: string;
  userRole: string;
  page: number;
  limit: number;
  search?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

export class ProjectRepository {
  async findMany(options: ProjectQueryOptions) {
    const { userId, userRole, page, limit, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // NON-ADMIN users only see projects they created or belong to as members
    if (userRole !== Role.ADMIN) {
      whereClause.OR = [
        { createdById: userId },
        { members: { some: { userId } } },
      ];
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      ];
    }

    const [projects, totalRecords] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { tasks: true, members: true },
          },
        },
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return { projects, totalRecords };
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
    });
  }

  async create(data: { name: string; description?: string; createdById: string }): Promise<Project> {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          createdById: data.createdById,
        },
      });

      // Automatically add project creator as a project member
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: data.createdById,
        },
      });

      return project;
    });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }
}

export const projectRepository = new ProjectRepository();
