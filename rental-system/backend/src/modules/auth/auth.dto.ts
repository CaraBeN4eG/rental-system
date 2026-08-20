import { z } from 'zod';

export const RegisterSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['CLIENT', 'EMPLOYEE', 'ADMIN']).default('CLIENT'),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// Schema do uzupełnienia profilu klienta
export const ClientProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName:  z.string().min(2),
  phone:     z.string().min(9),
  address:   z.string().min(5),
});

export type RegisterDto      = z.infer<typeof RegisterSchema>;
export type LoginDto         = z.infer<typeof LoginSchema>;
export type ClientProfileDto = z.infer<typeof ClientProfileSchema>;