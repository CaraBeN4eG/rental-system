import { z } from 'zod';

export const equipSchema = z.object
    ({
        categoryId: z.string().min(1),
        name: z.string(),
        description: z.string().optional(),
        serialNumber: z.string().optional(),
        dailyRate: z.float64(),
        depositAmount: z.float64()
    });

export type equipDTO = z.infer<typeof equipSchema>;

// --- CSV row schema (Każde pole - to wiersz dla CSV)
export const CsvRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  dailyRate: z.string().min(1),
  depositAmount: z.string().min(1),
  categoryId: z.string().min(1)
});

export type CsvRow = z.infer<typeof CsvRowSchema>;