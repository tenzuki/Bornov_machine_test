import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { checkProjectAccess } from '../middleware/resource.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectParamsSchema,
  projectPaginationSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
} from '../schemas/project.schema';
import { Role } from '../config/roles';

const router = Router();

// All project routes require valid authentication
router.use(authenticateToken);

router.get('/', validate(projectPaginationSchema), projectController.getProjects);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.MANAGER),
  validate(createProjectSchema),
  projectController.createProject
);

router.get('/:id', validate(getProjectParamsSchema), checkProjectAccess('READ'), projectController.getProject);

router.patch('/:id', validate(updateProjectSchema), checkProjectAccess('MANAGE'), projectController.updateProject);

router.delete('/:id', validate(getProjectParamsSchema), checkProjectAccess('DELETE'), projectController.deleteProject);

// Member sub-routes
router.get('/:id/members', validate(getProjectParamsSchema), checkProjectAccess('READ'), projectController.getMembers);

router.post(
  '/:id/members',
  validate(addProjectMemberSchema),
  checkProjectAccess('MANAGE'),
  projectController.addMember
);

router.delete(
  '/:id/members/:userId',
  validate(removeProjectMemberSchema),
  checkProjectAccess('MANAGE'),
  projectController.removeMember
);

export default router;
