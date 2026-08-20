import { CreateUserDTO, UpdateUserDTO } from './users.dto';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// CRUD
export async function createUser(data: CreateUserDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (user) throw new Error('User with this email already exists');
    const hash = await bcrypt.hash(data.password, 11);
    const newUser = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: hash,
            role: data.role,
        }
    });
    const { passwordHash: _, ...safe } = newUser; // tak my nie pokazujemy w odpowiedzi hasła
    return safe;
}
export async function getAllUsers() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    return users;
}
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, role: true }
    });
    if (!user) throw new Error('User not found');
    return user;
}
export async function getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true }
    });
    if (!user) throw new Error('User not found');
    return user;
}
export async function updateUser(id: string, data: UpdateUserDTO) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    if (data.email) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser && existingUser.id !== id) // sprawdzamy, czy email nie należy do innego użytkownika
            throw new Error('User with this email already exists');
    }

    const hash = (data.password) ? await bcrypt.hash(data.password, 11) : undefined;

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            email: data.email,
            passwordHash: hash,
            role: data.role
        }
    });

    const { passwordHash: _, ...safe } = updatedUser;
    return safe;
}
export async function deleteUser(id: string) {
    await getUserById(id); // Sprawdzamy, czy (ID) użytkownik istnieje
    const deletedUser = await prisma.user.delete({
        where: { id }
    });

    const { passwordHash: _, ...safe } = deletedUser;
    return safe;
}