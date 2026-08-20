import { z } from 'zod';

export const ClientDTO = z.object
({
    id: z.string().min(1),
    userId: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    phone:z.string(),
    address: z.string(),
    depositPaid:z.number()
})
export const CreateClientDTO = z.object
    ({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    address: z.string(),
    })
export const UpdateClientDTO = z.object
({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone:z.string().optional(),
    address: z.string().optional(),
    depositPaid:z.float64().optional()    
})
export type ClientDTO = z.infer<typeof ClientDTO>;
export type CreateClientDTO = z.infer<typeof CreateClientDTO>;
export type UpdateClientDTO = z.infer<typeof UpdateClientDTO>;