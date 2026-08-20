export interface ReportRow {
  id: string;
  client: string | null;
  totalAmount: number;
  penaltyAmount: number;
  returnedAt: Date | null;
}
export interface ReportData {
  rentals: ReportRow[];
  totalRevenue: number;
  totalPenalties: number;
  grandTotal: number;
};