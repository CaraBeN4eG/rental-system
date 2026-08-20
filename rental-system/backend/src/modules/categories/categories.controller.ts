import { Request, Response, RequestHandler } from 'express';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from './categories.service';

import { AuthRequest } from '../../shared/auth-request';
import { logAudit } from '../audit/audit.service';

export async function getAllController(req: Request, res: Response) {
    try {
        const allCategories = await getAllCategories();
        res.json(allCategories);

    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
}
export const getByIdController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const category = await getCategoryById(id);
        return res.json(category);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export async function createController(req: Request, res: Response) {
    try {
        const data = req.body;
        const newCategory = await createCategory(data);
        res.status(201).json(newCategory);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'CREATE',
                entityType: 'CATEGORY',
                entityId: newCategory.id,
                oldData: null,
                newData: JSON.stringify(newCategory)
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const updateController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const before = await getCategoryById(id);
        const updated = await updateCategory(id, data);
        res.json(updated);

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'UPDATE',
                entityType: 'CATEGORY',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: JSON.stringify(updated)
            });
    }
    catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}
export const deleteController: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id as string;
        const before = await getCategoryById(id);
        await deleteCategory(id);
        res.json({ message: 'Category deleted' });

        await logAudit
            ({
                userId: (req as AuthRequest).user.userId,
                rentalId: null,
                action: 'DELETE',
                entityType: 'CATEGORY',
                entityId: id,
                oldData: JSON.stringify(before),
                newData: null
            });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
}