import { projectRepository, ProjectQueryOptions } from '../repositories/project.repository';
import { projectMemberRepository } from '../repositories/project-member.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

export class ProjectService {
  async getProjects(options: ProjectQueryOptions) {
    const { projects, totalRecords } = await projectRepository.findMany(options);
    const totalPages = Math.ceil(totalRecords / options.limit) || 1;

    return {
      projects,
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

  async getProjectById(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }
    return project;
  }

  async createProject(input: CreateProjectInput, createdById: string) {
    return projectRepository.create({
      name: input.name,
      description: input.description,
      createdById,
    });
  }

  async updateProject(id: string, input: UpdateProjectInput) {
    await this.getProjectById(id);
    return projectRepository.update(id, input);
  }

  async deleteProject(id: string) {
    await this.getProjectById(id);
    await projectRepository.delete(id);
  }

  async addMember(projectId: string, userIdToAdd: string) {
    await this.getProjectById(projectId);

    const userToAdd = await userRepository.findById(userIdToAdd);
    if (!userToAdd) {
      throw AppError.notFound('User to add was not found');
    }

    const existingMembership = await projectMemberRepository.findMembership(projectId, userIdToAdd);
    if (existingMembership) {
      throw AppError.conflict('User is already a member of this project');
    }

    return projectMemberRepository.addMember(projectId, userIdToAdd);
  }

  async removeMember(projectId: string, userIdToRemove: string) {
    await this.getProjectById(projectId);

    const existingMembership = await projectMemberRepository.findMembership(projectId, userIdToRemove);
    if (!existingMembership) {
      throw AppError.notFound('User is not a member of this project');
    }

    await projectMemberRepository.removeMember(projectId, userIdToRemove);
  }

  async getMembers(projectId: string) {
    await this.getProjectById(projectId);
    return projectMemberRepository.getProjectMembers(projectId);
  }
}

export const projectService = new ProjectService();
