// Bo Zod ratuje sprawdzając, wówczas jak te dane pisze serwer
export interface LogAuditInput
{
  userId: string | null;
  rentalId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldData: string | null;
  newData: string | null;
}
export interface LogAuditFilters
{
  userId?: string;
  rentalId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
}