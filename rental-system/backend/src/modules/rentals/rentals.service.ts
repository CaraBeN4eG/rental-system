import { createRentalDTO, returnRentalDTO } from "./rentals.dto";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ClientProfileMissingError extends Error {
    code: string;

    constructor() {
        super('Musisz najpierw uzupełnić swoje dane jako klient');
        this.code = 'CLIENT_PROFILE_MISSING'; // Samodzielny kod błędu, bo wywołuje modalne okno we frontendzie
    }
}
class MissingClientIdError extends Error {
    code: string;

    constructor() {
        super('Musisz najpierw uzupełnić dane klienta');
        this.code = 'CLIENT_ID_REQUIRED';
    }
}

// CR
export async function createRental(user: { userId: string, role: string }, data: createRentalDTO) {
    const equipmentIds = data.equipmentIds; // wypożyczalne urządzenia
    let clientId: string;                   // kto wypożycza
    let employeeId: string | null = null;   // jeżeli pracownik wypożycza klientowi - to który

    // console.log('🔥 createRental REACHED');

    if (user.role == 'CLIENT') {    
        const client = await prisma.client.findUnique({ where: { userId: user.userId } });
        if (!client) throw new ClientProfileMissingError();
        clientId = client.id;
    } else { // EMPLOYEE lub ADMIN
        if (!data.clientId) throw new MissingClientIdError();
        clientId = data.clientId;
        employeeId = user.userId;
    }

    // pobieramy listę urządzeń
    const equipments = await prisma.equipment.findMany({ where: { id: { in: equipmentIds } } });
    // czy każde urządzenie dostępne w danym czasie?
    for (const eq of equipments) {
        if (eq.status !== 'AVAILABLE')
            throw new Error(`urządzenie [${eq.id}] ${eq.name} jest niedostępne`);
    }

    // tworzymy nowe wypożyczenie
    const newRent = await prisma.rental.create
        ({
            data:
            {
                clientId,
                employeeId,
                status: "ACTIVE",
                startDate: new Date(data.startDate),
                expectedEnd: new Date(data.expectedEnd)
            }
        });
    // wypełniemy wypożecznonymi obiektami
    await prisma.rentalItem.createMany
        ({
            data: equipments.map // tworzy kopii urządzeń z połączeniem "rentalId" do tabeli "rentalItem"
                (eq =>
                ({
                    rentalId: newRent.id,
                    equipmentId: eq.id,
                    dailyRate: eq.dailyRate
                })
                )
        });
    // wskaźmy c zostało wypożyczone
    await prisma.equipment.updateMany
        ({
            where: { id: { in: equipmentIds } },
            data: { status: "RENTED" }
        });

    // wracamy pełną wypożyczalnię
    return await prisma.rental.findUnique
        ({
            where: { id: newRent.id },
            include: // podłączamy powiązane tabele
            {
                rentalItems: true,
                client: true
            }
        });
}

// UWAGA: brak transakcji (prisma.$transaction): jeśli update zostanie wykonany nie całkiem -> rental będzie RETURNED, choć część sprzętu nie zostanie zaktualizowana -> nie spójność bazy
// Świadomie pominięte dla uproszczenia (potencjalna wrażliwość, nie priorytet dla MVP).
export async function returnRental(rentalId: string, items: { equipmentId: string, condition: string, status: string }[]) {
    // szukamy wypożyczenie
    const rental = await prisma.rental.findUnique
        ({
            where: { id: rentalId },
            include: { rentalItems: true }
        });
    if (!rental) throw new Error("wypożyczenie nie istnieje");
    if (rental?.status !== "ACTIVE") throw new Error('wypożyczenie ma nie aktywny status');

    // walidacja: liczba przekazanych items musi się zgadzać z liczbą sprzętu w wypożyczeniu
    if (items.length !== rental.rentalItems.length) {
        throw new Error('Lista sprzętu nie zgadza się z wypożyczeniem');
    }
    // walidacja: każdy equipmentId musi należeć do tego wypożyczenia
    const validIds = new Set(rental.rentalItems.map(i => i.equipmentId));
    for (const item of items) {
        if (!validIds.has(item.equipmentId)) {
            throw new Error(`Sprzęt ${item.equipmentId} nie należy do tego wypożyczenia`);
        }
    }

    // liczmy okres wypożyczenia
    const start = new Date(rental.startDate);
    const actualEnd = new Date();
    let period = actualEnd.getTime() - start.getTime(); // ms
    period = Math.ceil(period / (1000 * 60 * 60 * 24));

    // Prisma::reduce(accumulator, current) => newAccumulator
    // ∀ item += item.dailyRate * days
    const totalAmount = rental.rentalItems.reduce((sum, item) => sum + item.dailyRate * period, 0);

    // kara za spóżnienie
    let penaltyAmount = 0;
    const exceptedEnd = new Date(rental.expectedEnd);
    if (actualEnd > exceptedEnd) {
        let timeLate = actualEnd.getTime() - exceptedEnd.getTime();
        timeLate = Math.ceil(timeLate / (1000 * 60 * 60 * 24));
        penaltyAmount = rental.rentalItems.reduce((sum, item) => sum + timeLate * (item.dailyRate * 1.5), 0);
    }

    // odświeżamy dane
    const updated = await prisma.rental.update
        ({
            where: { id: rentalId },
            data: { actualEnd, status: "RETURNED", totalAmount, penaltyAmount, },
            include: { rentalItems: true, client: true }
        });


    // oznaczamy zwrócony sprzęt - items już zawiera gotowe dane z frontendu
    for (const item of items) {
        await prisma.rentalItem.update({
            where: { rentalId_equipmentId: { rentalId, equipmentId: item.equipmentId } },
            data: { condition: item.condition, returnedAt: actualEnd }
        });

        await prisma.equipment.update({
            where: { id: item.equipmentId },
            data: { status: item.status }
        });
    }

    return updated;
}

// bierzemy wypożyczenia i dotyczne (klient tylko swoje)
export async function getAllRentals(user: { userId: string; role: string }) {
    const where = user.role === 'CLIENT' ? { client: { userId: user.userId } } : {};

    const rentals = await prisma.rental.findMany({
        where,
        include: {
            client: true,
            rentalItems: {
                include: { equipment: true }
            }
        }
    });

    return rentals;
}

export async function getByIdRentals(id: string) {
    return await prisma.rental.findUnique({
        where: { id },
        include: { rentalItems: true, client: true }
    });
}