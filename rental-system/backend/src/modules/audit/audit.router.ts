import { Router, RequestHandler } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getAllController} from "./audit.controller";

const router = Router();

router.get("/", authMiddleware, requireRole('ADMIN'), getAllController as RequestHandler);

export { router as auditRouter };