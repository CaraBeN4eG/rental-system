import { Request, Response, NextFunction } from "express";
import { AuthRequest } from '../shared/auth-request';

export function requireRole(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return res.status(401).json({ message: 'Brak autoryzacji' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Brak uprawnień do wykonania tej operacji' });
        }
        next();
    };
}