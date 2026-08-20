import { equipDTO, CsvRow, CsvRowSchema } from './equipment.dto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createEquipment(equip: equipDTO) {
  const newEquip = await prisma.equipment.create
    (
      {
        data:
        {
          categoryId: equip.categoryId,
          name: equip.name,
          description: equip.description,
          serialNumber: equip.serialNumber,
          dailyRate: equip.dailyRate,
          depositAmount: equip.depositAmount
        }
      }
  );
  return newEquip;
}
// Pobieranie listy całego sprzętu
export async function getAllEquipment() {
  return await prisma.equipment.findMany({ include: { category: true } }); // dołącza dane kategorii
}

// Pobieranie jednego sprzętu po ID
export async function getEquipmentById(id: string) {
  return await prisma.equipment.findUnique({ where: { id } });
}

// Aktualizacja sprzętu
export async function updateEquipment(id: string, data: equipDTO) {
  return await prisma.equipment.update({ where: { id }, data });
}

// Usuwanie sprzętu
export async function deleteEquipment(id: string) {
  return await prisma.equipment.delete({ where: { id } });
}

import { parse } from 'csv-parse/sync';

export async function importFromCsv(fileBuffer: Buffer) {
  const text = fileBuffer.toString('utf-8');

  // Парсимо CSV (columns: true => перший рядок — заголовки)
  const records: Record<string, string>[] = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const dataToInsert = [];
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      // Валідація Zod (перевіряє, що всі потрібні поля є рядками)
      const parsed = CsvRowSchema.parse(row as CsvRow);

      // Конвертація чисел
      const dailyRate = parseFloat(parsed.dailyRate.replace(',', '.'));
      const depositAmount = parseFloat(parsed.depositAmount.replace(',', '.'));

      if (Number.isNaN(dailyRate) || Number.isNaN(depositAmount)) {
        throw new Error('Invalid number format for dailyRate or depositAmount');
      }

      dataToInsert.push({
        name: parsed.name,
        description: parsed.description ?? null,
        serialNumber: parsed.serialNumber ?? null,
        dailyRate,
        depositAmount,
        categoryId: parsed.categoryId,
        status: 'AVAILABLE'
      });
    } catch (err: any) {
      errors.push({ row: i + 2, reason: err.message }); // +2: 1 для заголовка, +1 для 0‑індекса
    }
  }

  if (dataToInsert.length === 0) {
    return { imported: 0, errors };
  }

  const result = await prisma.equipment.createMany({
    data: dataToInsert,
  });

  const importedCount = (result as any)?.count ?? dataToInsert.length;

  return { imported: importedCount, errors };
}