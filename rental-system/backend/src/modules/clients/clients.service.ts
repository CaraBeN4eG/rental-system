import {CreateClientDTO, UpdateClientDTO} from "./clients.dto";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CRUD
export async function createClient(userId: string, data: CreateClientDTO) {
    const newClient = await prisma.client.create
        ({
            data:
            {
                userId, // to już mamy, bo zalogowany użytkownik jest właścicielem klienta
                    
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                address: data.address,
            }
        })
    return newClient;
}
export async function getAllClients()
{
    return await prisma.client.findMany();
}
export async function getClientById(id: string)
{
    return await prisma.client.findUnique({ where: { id } });
}
export async function updateClient(id: string, data: UpdateClientDTO)
{
    return await prisma.client.update({ where: { id }, data: data });
}
export async function deleteClient(id: string)
{
    return await prisma.client.delete({ where: { id } });
}
