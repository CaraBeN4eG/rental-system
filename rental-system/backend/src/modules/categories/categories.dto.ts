import { z } from 'zod';

export const categoryGruppa = z.object({ name: z.string().min(1) });

export type categoryDto = z.infer<typeof categoryGruppa>;