import { Request, Response } from "express";
import { createRental, getAllRentals, getByIdRentals, returnRental } from './rentals.service';
import { createRentalDTO, returnRentalDTO } from "./rentals.dto";
import { AuthRequest } from "../../shared/auth-request";

import { logAudit } from "../audit/audit.service";

// CRUD
// układamy umowę wypożyczenia
export async function createController(req: Request, res: Response) {
    try {
        const user = (req as AuthRequest).user;
        // console.log('=== USER ===:', user);
        const data = createRentalDTO.parse(req.body);
        // console.log('=== DATA ===:', data);
        const newRent = await createRental(user, data);
        // console.log('=== NEW RENTAL ===:', newRent);

        if (!newRent) throw new Error('Nie udało się utworzyć wypożyczenia');
        res.json(newRent);

        await logAudit
            ({
            userId: (req as AuthRequest).user.userId,
            rentalId: newRent.id, 
            action: 'CREATE',
            entityType: 'RENTAL',
            entityId: newRent.id,
            oldData: null,
            newData: JSON.stringify(newRent),
            });

    } catch (err: any) {
        if (err?.code === 'CLIENT_PROFILE_MISSING' || err?.code === 'CLIENT_ID_REQUIRED')
        {
            return res.status(400).json({ code: err.code, message: err.message });
        }
        // coś innego
        return res.status(400).json({ message: "Validation error", issues: err.errors }); // оцю помилку віправляє без обраного Klient через ADMIN
    }
}
// zamykamy umowę
export async function returnController(req: Request, res: Response) {
    try {
        const rentalId = req.params.id as string;
        const body = returnRentalDTO.parse(req.body);

        const before = await getByIdRentals(rentalId);
        const updated = await returnRental(rentalId, body.items);
        res.json(updated);

        await logAudit({
            userId: (req as AuthRequest).user.userId,
            rentalId: rentalId,
            action: 'UPDATE',
            entityType: 'RENTAL',
            entityId: rentalId,
            oldData: JSON.stringify(before),
            newData: JSON.stringify(updated),
        });
    } catch (err: any) {
        return res.status(400).json({ message: "Validation error", issues: err.errors });
    }
}
// bierzemy wypożyczenia
export async function getAllController(req: Request, res: Response) {
    try {
        const user = (req as AuthRequest).user;
        const rentals = await getAllRentals(user);
        
        res.json(rentals);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}
export async function getByIdController(req: Request, res: Response) {
    try {
        const rentalId = req.params.id as string;
        const rental = await getByIdRentals(rentalId);
        res.json(rental);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}