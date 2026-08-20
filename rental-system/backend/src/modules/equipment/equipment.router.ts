import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getAllController, getByIdController, createController, updateController, deleteController, importController } from './equipment.controller';

const router = Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authMiddleware, getAllController as RequestHandler);
router.get('/:id',authMiddleware, getByIdController);
router.post('/', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'),createController as RequestHandler);
router.put('/:id', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'),updateController);
router.delete('/:id',authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), deleteController as RequestHandler);
router.post('/import', authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), upload.single('file'), importController as RequestHandler);

export {router as equipmentRouter};
