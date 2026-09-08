import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing records in reverse dependency order
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Project Manager',
      email: 'manager@example.com',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Standard Developer',
      email: 'user@example.com',
      passwordHash,
      role: 'USER',
    },
  });

  console.log(`✅ Users created: ${admin.email}, ${manager.email}, ${user.email}`);

  // 2. Create Sample Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Task Collaboration Platform',
      description: 'A full-stack collaborative system for project management and issue tracking.',
      createdById: manager.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Revamping the user interface and API client for the mobile companion application.',
      createdById: admin.id,
    },
  });

  console.log(`✅ Projects created: "${project1.name}", "${project2.name}"`);

  // 3. Create Project Memberships
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: manager.id },
      { projectId: project1.id, userId: user.id },
      { projectId: project1.id, userId: admin.id },
      { projectId: project2.id, userId: admin.id },
      { projectId: project2.id, userId: user.id },
    ],
  });

  console.log('✅ Project memberships assigned');

  // 4. Create Sample Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Design DB Schema & ER Diagram',
        description: 'Define relational entities for User, Project, ProjectMember, and Task.',
        status: 'DONE',
        priority: 'HIGH',
        projectId: project1.id,
        createdById: manager.id,
        assignedToId: manager.id,
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      },
      {
        title: 'Implement Auth APIs with JWT',
        description: 'Build registration, login, token refresh, and auth middleware.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project1.id,
        createdById: manager.id,
        assignedToId: user.id,
        dueDate: new Date(Date.now() + 86400000 * 4),
      },
      {
        title: 'Setup UI Component Library',
        description: 'Create reusable Modal, Table, Badge, and Input UI controls.',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project1.id,
        createdById: user.id,
        assignedToId: user.id,
        dueDate: new Date(Date.now() + 86400000 * 7),
      },
      {
        title: 'Mobile Navigation Polish',
        description: 'Ensure smooth tab navigation and responsive sidebar layout.',
        status: 'TODO',
        priority: 'LOW',
        projectId: project2.id,
        createdById: admin.id,
        assignedToId: user.id,
      },
    ],
  });

  console.log('✅ Tasks created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
