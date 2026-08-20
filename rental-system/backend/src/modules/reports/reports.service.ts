import PDFDocument from "pdfkit";
import { ReportData, ReportRow } from "./reports.dto";
import stream from "stream"
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function writeReport(startDate: string, dateTo: string) {
 
    const from = new Date(startDate); // konwertujemy startDate na Date
    const to = new Date(dateTo);     // konwertujemy dateTo na Date
    to.setHours(23, 59, 59, 999);    // ustawiamy koniec dnia dla dateTo, żeby objąć cały dzień
    // Pobieramy wszystkie rental ze statusem RETURNED i createdAt w przedziale
    const rentals = await prisma.rental.findMany({
        where: {
            status: "RETURNED",
            createdAt: {
                gte: from,
                lte: to,
            },
        },
        include: {
            client: true, // dołączamy user, żeby mieć email/imię klienta
        },
        orderBy: { createdAt: "desc" },
    });

    // Mapujemy na prostsze wiersze raportu
    const rows: ReportRow[] = rentals.map((rent) => ({ // з кожним об'єктом розмоляємо через змінну rent
        id: rent.id,
        client: rent.client?.firstName ?? rent.client?.lastName ?? rent.client?.userId ?? null, // витягуємо userId та ім'я клієнта, яке зможем
        totalAmount: Number(rent.totalAmount ?? 0),
        penaltyAmount: Number(rent.penaltyAmount ?? 0),
        returnedAt: rent.actualEnd ?? null // записуємо дату повернення або bull
    }));

    // Sumy
    // Zapisuje do zmiennej znaczenie z: do sum=0 dodajemy z każdego wiersza totalAmount  
    const totalRevenue = rows.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalPenalties = rows.reduce((sum, row) => sum + row.penaltyAmount, 0);
    const grandTotal = totalRevenue + totalPenalties;

    return {
        rentals: rows,
        totalRevenue,
        totalPenalties,
        grandTotal,
    };
}

/*
 Generuje PDF (Buffer) na podstawie danych RevenueData.
 Zwraca Buffer z binarnymi danymi PDF.
*/
export async function generatePDF(data: ReportData, startDate: string, dateTo: string): Promise<Buffer> {
  // Tworzymy dokument PDF
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Zbieramy chunk'i do bufora
  const buffers: Buffer[] = [];
  const passthrough = new stream.PassThrough();
  doc.pipe(passthrough);

  passthrough.on("data", (chunk: Buffer) => buffers.push(Buffer.from(chunk)));

  const endPromise = new Promise<Buffer>((resolve, reject) => {
    passthrough.on("end", () => resolve(Buffer.concat(buffers)));
    passthrough.on("error", (err) => reject(err));
    doc.on("error", (err) => reject(err));
  });

  // Nagłówek dokumentu
  doc.fontSize(18).text("Raport przychodów", { align: "center" });
  doc.moveDown(0.5);

  // Okres raportu
  doc.fontSize(10).text(`Okres: ${startDate} — ${dateTo}`, { align: "center" });
  doc.moveDown(1);

  // Rysujemy nagłówek tabeli
  doc.fontSize(10);
  const startX = 50;
  doc.text("Rental ID", startX, doc.y, { continued: true, width: 120 });
  doc.text("Klient", startX + 120, doc.y, { continued: true, width: 150 });
  doc.text("Kwota", startX + 270, doc.y, { continued: true, width: 70, align: "right" });
  doc.text("Kara", startX + 340, doc.y, { continued: true, width: 70, align: "right" });
  doc.text("Data zwrotu", startX + 410, doc.y, { width: 130, align: "right" });
  doc.moveDown(0.5);
  doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Wiersze tabeli
  doc.fontSize(9);
  for (const row of data.rentals) {
    const returned = row.returnedAt ? new Date(row.returnedAt).toLocaleString() : "-";
    doc.text(row.id, startX, doc.y, { continued: true, width: 120 });
    doc.text(row.client ?? "—", startX + 120, doc.y, { continued: true, width: 150 });
    doc.text(row.totalAmount.toFixed(2), startX + 270, doc.y, { continued: true, width: 70, align: "right" });
    doc.text(row.penaltyAmount.toFixed(2), startX + 340, doc.y, { continued: true, width: 70, align: "right" });
    doc.text(returned, startX + 410, doc.y, { width: 130, align: "right" });
    doc.moveDown(0.5);

    // Jeśli zbliżamy się do końca strony, dodaj nową i powtórz nagłówek
    if (doc.y > 700) {
      doc.addPage();
      doc.moveDown(1);
      doc.fontSize(10);
      doc.text("Rental ID", startX, doc.y, { continued: true, width: 120 });
      doc.text("Klient", startX + 120, doc.y, { continued: true, width: 150 });
      doc.text("Kwota", startX + 270, doc.y, { continued: true, width: 70, align: "right" });
      doc.text("Kara", startX + 340, doc.y, { continued: true, width: 70, align: "right" });
      doc.text("Data zwrotu", startX + 410, doc.y, { width: 130, align: "right" });
      doc.moveDown(0.5);
      doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(9);
    }
  }

  // Podsumowanie na końcu
  doc.moveDown(1);
  doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(11).text(`Suma przychodów: ${data.totalRevenue.toFixed(2)} PLN`, { align: "right" });
  doc.moveDown(0.2);
  doc.fontSize(11).text(`Suma kar: ${data.totalPenalties.toFixed(2)} PLN`, { align: "right" });
  doc.moveDown(0.2);
  doc.fontSize(12).text(`Razem: ${data.grandTotal.toFixed(2)} PLN`, { align: "right", underline: true });

  // Kończymy dokument
  doc.end();

  // Zwracamy Buffer po zakończeniu zapisu PDF
  return await endPromise;
}