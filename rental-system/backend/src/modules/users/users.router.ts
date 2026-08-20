import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { createController, getAllController, getByIdController, updateController, deleteController, getByEmailController } from './users.controller';

const router = Router();
router.post('/', authMiddleware, requireRole('ADMIN'), createController as RequestHandler);
router.get('/', authMiddleware, requireRole('ADMIN'), getAllController as RequestHandler);
router.get('/id/:id', authMiddleware, requireRole('ADMIN'), getByIdController as RequestHandler);
router.get('/email/:email', authMiddleware, requireRole('ADMIN'), getByEmailController as RequestHandler);
router.put('/:id', authMiddleware, requireRole('ADMIN'), updateController as RequestHandler);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteController as RequestHandler);

export { router as usersRouter };