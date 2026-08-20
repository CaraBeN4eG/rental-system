import { z } from 'zod';

export const CreateUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['CLIENT', 'EMPLOYEE', 'ADMIN']),
});
export const UpdateUserDTO = z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['CLIENT', 'EMPLOYEE', 'ADMIN']).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;