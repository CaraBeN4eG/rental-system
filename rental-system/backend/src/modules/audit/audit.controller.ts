import { Request, Response } from "express";
import { getAuditLogs } from './audit.service';

export async function getAllController(req: Request, res: Response) {
  try {
    const logs = await getAuditLogs(req.query);
    res.json(logs);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}