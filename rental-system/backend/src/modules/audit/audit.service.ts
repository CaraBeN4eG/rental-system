import { LogAuditInput, LogAuditFilters } from "./audit.dto";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function logAudit(data: LogAuditInput) {
  try {
    await prisma.auditLog.create({ data });
  } catch (err) {
    // błąd audytu musi pozostać w cieniu (nie przerywać głównej operacji)
    console.error('Audit log failed:', err);
  }
}
export async function getAuditLogs(filters: LogAuditFilters) {
  const where: any = {};
  // Frontend nie jest źródłem prawdy dla backendu
  if (filters.userId !== undefined) where.userId = filters.userId;
  if (filters.rentalId !== undefined) where.rentalId = filters.rentalId;
  if (filters.action !== undefined) where.action = filters.action;
  if (filters.entityType !== undefined) where.entityType = filters.entityType;
  if (filters.entityId !== undefined) where.entityId = filters.entityId;

  return await prisma.auditLog.findMany({
    where,
    include: { user: true, rental: true },
    orderBy: { createdAt: "desc" }
  });
}