import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { createController, createMeController, getAllController, getClientByIdController, updateController, deleteController } from './clients.controller';
const router = Router();

router.post('/', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), createController as RequestHandler);
router.post('/me', authMiddleware,requireRole('CLIENT'), createMeController as RequestHandler); // metod tylko dla klienta, jawny podział
router.get('/', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'),getAllController as RequestHandler);
router.get('/:id', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'),getClientByIdController as RequestHandler);
router.put('/:id', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'),updateController as RequestHandler);
// router.patch('/:id', updateController); wtedy aktualizujemy tylko zmienione
router.delete('/:id', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), deleteController as RequestHandler);

export { router as clientsRouter };