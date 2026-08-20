import { Request, Response, RequestHandler } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserByEmail } from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './users.dto';
import { AuthRequest } from '../../shared/auth-request';

import { logAudit } from '../audit/audit.service';

export const createController: RequestHandler = async (req, res) => {
    try {
        const userData = CreateUserDTO.parse(req.body);
        const newUser = await createUser(userData);
        res.json(newUser);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'CREATE',
                entityType: 'USER',
                entityId: newUser.id,
                oldData: null,
                newData: JSON.stringify(newUser)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const getAllController: RequestHandler = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const getByIdController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const user = await getUserById(id);
        res.json(user);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const getByEmailController: RequestHandler = async (req, res) => {
    try {
        const email = req.params.email as string;
        const user = await getUserByEmail(email);
        res.json(user);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const updateController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const currentUserId = (req as AuthRequest).user.userId;
        const data = UpdateUserDTO.parse(req.body);
        if (id === currentUserId && data.role && data.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Nie możesz odebrać sobie uprawnień administratora' });
        }
        const before = await getUserById(id);
        const updatedUser = await updateUser(id, data);
        res.json(updatedUser);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'UPDATE',
                entityType: 'USER',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: JSON.stringify(updatedUser)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const deleteController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        if (id === (req as AuthRequest).user.userId) return res.status(403).json({ message: 'Nie możesz usunąć siebie' });
        const before = await getUserById(id);
        await deleteUser(id);
        res.json({ message: 'User deleted' });


        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'DELETE',
                entityType: 'USER',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: null
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}