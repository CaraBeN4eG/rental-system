import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../shared/auth-request';

// sync → jwt.verify(token, secret)
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']; // bierzemy pole 'authorization'
    if (!authHeader) { return res.status(401).json({ message: 'Brak tokenu autoryzacji' }); }
    const parts = authHeader.split(' '); // dzieli na osobne "part" według spacji
    if (parts.length !== 2 || parts[0] !== 'Bearer') //  Bearer - nazwa schematu autoryzacji w standarcie RFC 6750 (Angular)
    {
        return res.status(401).json({ message: 'Nieprawidłowy format nagłówka Authorization' });
    }
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as 
            {userId: string; role: string;};
        (req as AuthRequest).user = // samodzielny typ z polami do weryfikacji
        {
            userId: decoded.userId,
            role: decoded.role,
        };
        next(); // skończyliśmy sprawdać, wracamy do poleceń użytkownika
    } catch (err: any) {
        return res.status(401).json({ message: 'Token jest nieprawidłowy lub wygasł' });
    }
}