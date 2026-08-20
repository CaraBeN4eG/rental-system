import { Request, Response, RequestHandler } from 'express';
type MulterRequest = Request & { file?: Express.Multer.File };
import { createEquipment, getAllEquipment, getEquipmentById, updateEquipment, deleteEquipment, importFromCsv } from './equipment.service';
import { AuthRequest } from '../../shared/auth-request';

import { logAudit } from '../audit/audit.service';

// Pobieranie listy sprzętu
export async function getAllController(req: Request, res: Response) {
    try {
        const allEquip = await getAllEquipment();
        res.json(allEquip);
    }
    catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// Pobieranie jednego sprzętu
export const getByIdController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const equip = await getEquipmentById(id);
        return res.json(equip);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// Tworzenie sprzętu
export async function createController(req: Request, res: Response) {
    try {
        const data = req.body;
        const newEquip = await createEquipment(data);
        res.status(201).json(newEquip);
        
        await logAudit
        ({
            userId: (req as AuthRequest).user.userId,
            rentalId: null,
            action: 'CREATE',
            entityType: 'EQUIPMENT',
            entityId: newEquip.id,
            oldData: null,
            newData: JSON.stringify(newEquip)
        });
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}
// Aktualizacja sprzętu
export const updateController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const before = await getEquipmentById(id);
        const updated = await updateEquipment(id, data);
        res.json(updated);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'UPDATE',
                entityType: 'EQUIPMENT',
                entityId: updated.id,
                oldData: JSON.stringify(before),
                newData: JSON.stringify(updated)
            });
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}
// Usuwanie sprzętu
export const deleteController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const before = await getEquipmentById(id);
        await deleteEquipment(id);
        res.json({ message: 'Sprzęt usunięty' })
        
        await logAudit
        ({
            userId: (req as AuthRequest).user.userId,
            rentalId: null,
            action: 'DELETE',
            entityType: 'EQUIPMENT',
            entityId: id,
            oldData: JSON.stringify(before),
            newData: null
        });
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
}
// Import danych z CSV pliku
export async function importController(req: MulterRequest, res: Response) {
    try {
        const file = req.file; // multer додає req.file
        if (!file || !file.buffer) {
            return res.status(400).json({ message: 'Brak pliku CSV' });
        }

        const result = await importFromCsv(file.buffer);
        return res.status(201).json(result);
    } catch (err: any) { return res.status(500).json({ message: err.message }); }
}