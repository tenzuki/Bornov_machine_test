import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { checkTaskAccess } from '../middleware/resource.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskParamsSchema,
  taskQuerySchema,
} from '../schemas/task.schema';

const router = Router();

// All task routes require valid authentication
router.use(authenticateToken);

router.get('/', validate(taskQuerySchema), taskController.getTasks);

router.post('/', validate(createTaskSchema), taskController.createTask);

router.get('/:id', validate(getTaskParamsSchema), checkTaskAccess('READ'), taskController.getTask);

router.patch('/:id', validate(updateTaskSchema), checkTaskAccess('UPDATE'), taskController.updateTask);

router.delete('/:id', validate(getTaskParamsSchema), checkTaskAccess('DELETE'), taskController.deleteTask);

export default router;
