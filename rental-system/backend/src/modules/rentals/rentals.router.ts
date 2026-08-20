import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { createController, getAllController, getByIdController, returnController } from './rentals.controller';

const router = Router();

router.post("/", authMiddleware, createController as RequestHandler);
router.put("/:id/return", authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), returnController as RequestHandler);
router.get("/", authMiddleware, getAllController as RequestHandler);
router.get("/:id", authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), getByIdController as RequestHandler);

export { router as rentalsRouter };