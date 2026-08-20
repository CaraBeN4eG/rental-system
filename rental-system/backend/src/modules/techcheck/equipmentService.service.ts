import { startServiceDTO, finishServiceDTO } from "./equipmentService.dto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function startService(data: startServiceDTO) {
    const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId },
    });

    if (!equipment) { throw new Error("urządzenie nie istnieje"); }

    const serviceRecord = await prisma.equipmentService.create({
        data:
        {
            equipmentId: data.equipmentId,
            reason: data.reason,
            startedAt: new Date(),
            completedAt: null,
            cost: null
        }
    });
    await prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: "SERVICE" }
    });
    return serviceRecord;
}

export async function finishService(serviceId: string, data: finishServiceDTO) {
    const eq = await prisma.equipmentService.findUnique({
        where: { id: serviceId }
    });
    if (!eq) throw new Error("Nie znaleziono rekordu serwisowego");
    if (eq.completedAt !== null) throw new Error("Ten przegląd został już zakończony");

    const updated = await prisma.equipmentService.update({
        where: { id: serviceId },
        data: {
            completedAt: new Date(),
            cost: data.cost ?? null,
        },
    });

    await prisma.equipment.update({
        where: { id: eq.equipmentId },
        data: { status: "AVAILABLE" }
    });

    return updated;
}

export async function getServiceHistory(equipmentId: string) {
    return await prisma.equipmentService.findMany({
        where: { equipmentId },
        orderBy: { startedAt: "desc" }
    });
}

export async function getServiceById(id: string) {
    return await prisma.equipmentService.findUnique({ where: { id } });    
}