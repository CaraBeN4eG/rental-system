import { z } from 'zod';

export const createRentalDTO = z.object
    ({
        clientId:z.string().min(1).optional(), // przenosimy odpowiedzialność za konieczność wypełnienia do service
        employeeId: z.string().min(1).optional(),
        equipmentIds: z.array(z.string().min(1)),
        startDate: z.string().min(1),
        expectedEnd: z.string().min(1)
    });

export const returnRentalDTO = z.object
    ({
        items: z.array(z.object
            ({
                equipmentId: z.string(),
                condition: z.string().default(''),
                status: z.enum(['AVAILABLE', 'BROKEN', 'SERVICE']).default('AVAILABLE'),
            })),
    });    

export type createRentalDTO = z.infer<typeof createRentalDTO>;
export type returnRentalDTO = z.infer<typeof returnRentalDTO>;