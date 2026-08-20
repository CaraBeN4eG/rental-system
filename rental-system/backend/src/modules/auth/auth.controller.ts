import { Request, Response } from 'express';
import { registr, login } from './auth.service';

import { logAudit } from '../audit/audit.service';

export async function registerController(req: Request, res: Response) {
  try {
    const regData = req.body;
    const newUser = await registr(regData);
    res.json(newUser);

    await logAudit
      ({
        userId: newUser.userWithoutHash.id,
        rentalId: null,
        action: 'CREATE',
        entityType: 'USER',
        entityId: newUser.userWithoutHash.id,
        oldData: null,
        newData: JSON.stringify(newUser.userWithoutHash)
      });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const logData = req.body;
    const user = await login(logData);
    res.json(user);

    await logAudit
      ({
        userId: user.user.id,
        rentalId: null,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.user.id,
        oldData: null,
        newData: JSON.stringify(user.user)
      });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}