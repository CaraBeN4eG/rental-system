import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { generateReportController, getReportDataController } from './reports.controller';
const router = Router();

router.get("/generate",authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), generateReportController as RequestHandler);
router.get("/data", authMiddleware, requireRole('EMPLOYEE', 'ADMIN'), getReportDataController as RequestHandler); 

export { router as reportsRouter };