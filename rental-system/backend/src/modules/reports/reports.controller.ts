import { Request, Response } from "express";
import { writeReport, generatePDF } from './reports.service';

export async function generateReportController(req: Request, res: Response) {
    try {
        const { startDate, dateTo } = req.query as { startDate: string; dateTo: string };
        const reportData = await writeReport(startDate, dateTo);
        const pdfBuffer = await generatePDF(reportData, startDate, dateTo);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=raport.pdf"
        });
        res.send(pdfBuffer);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

export async function getReportDataController(req: Request, res: Response) {
    try {
        console.log(req.query)
        const { startDate, dateTo} = req.query as { startDate: string; dateTo: string };
        const reportData = await writeReport(startDate, dateTo);
        res.json(reportData);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}
