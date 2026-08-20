import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { startController, finishController, historyController } from "./equipmentService.controller";
const router = Router();

router.post("/",authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), startController as RequestHandler);
router.put("/:id/complete", authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), finishController as RequestHandler);
router.get("/equipment/:equipmentId", authMiddleware, historyController as RequestHandler);

export { router as equipmentServiceRouter };