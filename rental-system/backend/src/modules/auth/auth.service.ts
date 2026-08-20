import { LoginDto, RegisterDto } from "./auth.dto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // nadaje użytkowanikowi token

const prisma = new PrismaClient();

// Sekretny klucz do podpisywania tokenów
const JWT_SECRET = "super-secret-key";

// Funkcja pomocnicza — generuje token dla użytkownika
function generateToken(userId: string, role: string): string 
{
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export async function registr(data: RegisterDto) 
{
    // szukamy użytkownika
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (user) // taki użytkownik znaleziony => istnieje
        throw new Error('this email alreadu regidtered');
    // haszujemy hasło
    const hash = await bcrypt.hash(data.password, 11);
    // tworzymy nowego użytkowanika w bazie
    const newUser = await prisma.user.create
        ({
            data:
            {
                email: data.email,
                passwordHash: hash,
                role: data.role,
            }
        });

    // Generujemy token po rejestracji
    const token = generateToken(newUser.id, newUser.role);

    const { passwordHash, ...userWithoutHash } = newUser;
    return {userWithoutHash, token}; // tak my nie pokazujemy w odpowiedzi hasła
    // return newUser;
}
export async function login(data: LoginDto) 
{
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user)
        throw new Error('Niepoprawny email');

    const truePass = await bcrypt.compare(data.password, user.passwordHash);

    if (!truePass)
        throw new Error('Niepoprawne hasło');

    // Generujemy token po zalogowaniu
    const token = generateToken(user.id, user.role); 

    const { passwordHash, ...userWithoutPassword } = user;
return { user: userWithoutPassword, token };
    // return user;
}