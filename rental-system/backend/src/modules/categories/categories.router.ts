import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getAllController, getByIdController, createController, updateController, deleteController } from './categories.controller';

const  router = Router();

router.get('/', authMiddleware, getAllController as RequestHandler);
router.get('/:id',authMiddleware, getByIdController);
router.post('/', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), createController as RequestHandler);
router.put('/:id',authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), updateController);
router.delete('/:id',authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), deleteController);

export { router as categoriesRouter };