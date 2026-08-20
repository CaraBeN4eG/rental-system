import { Request, Response } from 'express';
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from './clients.service';
import { CreateClientDTO } from './clients.dto';
import { AuthRequest } from "../../shared/auth-request";

import { logAudit } from '../audit/audit.service';

// CRUD
// tworzymy klienta
export async function createController(req: Request, res: Response) {
    try {
        const userId = req.body.userId; // mamy już zalogowanego użytkownika, więc możemy pobrać jego ID
        const data = req.body;
        const newClient = await createClient(userId, data);
        res.status(201).json(newClient);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'CREATE',
                entityType: 'CLIENT',
                entityId: newClient.id,
                oldData: null,
                newData: JSON.stringify(newClient)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// osobne utwaorzenie konta klienta dla użytkowanika poziomu CLIENT 
export async function createMeController(req: Request, res: Response) {
    try {
        const user = (req as AuthRequest).user;
        const data = CreateClientDTO.parse(req.body);
        const newClient = await createClient(user.userId, data);
        res.json(newClient);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'CREATE',
                entityType: 'CLIENT',
                entityId: newClient.id,
                oldData: null,
                newData: JSON.stringify(newClient)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// bierzemy listę klientów
export async function getAllController(req: Request, res: Response) {
    try {
        const result = await getAllClients();
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// wybieramy pewnego klienta po ID
export async function getClientByIdController(req: Request, res: Response) {
    try {
        const client = await getClientById(req.params.id as string);
        res.json(client);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// zmieniamy dane klienta
export async function updateController(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const before = await getClientById(id);
        const updatedClient = await updateClient(id, data);
        res.json(updatedClient);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'UPDATE',
                entityType: 'CLIENT',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: JSON.stringify(updatedClient)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
// usuwamy klienta
export async function deleteController(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const before = await getClientById(id);
        await deleteClient(id);
        res.json({ message: 'Client deleted' });


        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'DELETE',
                entityType: 'CLIENT',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: null
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}