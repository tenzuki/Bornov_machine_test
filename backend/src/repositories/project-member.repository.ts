import { prisma } from '../config/database';
import { ProjectMember } from '@prisma/client';

export class ProjectMemberRepository {
  async findMembership(projectId: string, userId: string): Promise<ProjectMember | null> {
    return prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async addMember(projectId: string, userId: string): Promise<ProjectMember> {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
    });
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId,
      },
    });
  }

  async getProjectMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}

export const projectMemberRepository = new ProjectMemberRepository();
