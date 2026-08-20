import { z } from 'zod';
    
export const startService = z.object({
    equipmentId: z.string().min(1),
    reason: z.string()

});

export const finishService = z.object({
    cost: z.number().optional()
})

export type startServiceDTO = z.infer<typeof startService>;
export type finishServiceDTO = z.infer<typeof finishService>;
