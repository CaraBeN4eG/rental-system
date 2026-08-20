
import { Request, Response } from "express";
import { startService, finishService, getServiceHistory, getServiceById } from './equipmentService.service';
import { startService as startDTO, finishService as finishDTO } from './equipmentService.dto';

import { AuthRequest } from "../../shared/auth-request";
import { logAudit } from "../audit/audit.service";

/*
startController     ← POST /
completeController  ← PUT /:id/complete
historyController   ← GET /equipment/:equipmentId
*/
export async function startController(req: Request, res: Response) {
    try {
        const data = startDTO.parse(req.body);
        const reserv = await startService(data);
        res.json(reserv);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'CREATE',
                entityType: 'EQUIPMENT_SERVICE',
                entityId: reserv.id,
                oldData: null,
                newData: JSON.stringify(reserv),
            });

    } catch (err: any) {
        return res.status(400).json({ message: "Start service failed", issues: err.errors });
    }
}
export async function finishController(req: Request, res: Response) {
    try {
        const reservId = req.params.id as string;
        const reserv = finishDTO.parse(req.body);
        const before = await getServiceById(reservId);
        const serviceEnd = await finishService(reservId, reserv);
        res.json(serviceEnd);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'UPDATE',
                entityType: 'EQUIPMENT_SERVICE',
                entityId: serviceEnd.id,
                oldData: JSON.stringify(before),
                newData: JSON.stringify(serviceEnd),
            });

    } catch (err: any) {
        return res.status(400).json({ message: "Complete service failed", issues: err.errors });
    }
}

export async function historyController(req: Request, res: Response) {
    try {

        const eqId = req.params.equipmentId as string;
        const history = await getServiceHistory(eqId);
        res.json(history)
    } catch (err: any) {
        return res.status(400).json({ message: "Complete service failed", issues: err.errors });
    }
}