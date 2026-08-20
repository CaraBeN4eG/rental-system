import { Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; // będziemy sprawdzać ról użytkownika z tokenu 

interface TokenPayload { userId: string; role: string; }

@Injectable({ providedIn: 'root' }) // mówi, że ten jedyny serwis jest dostępny dla całej aplikacji
export class UserService {
    role = signal<string | null>(null);
    constructor() {
        this.updateRole();
    }

    updateRole() {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded: TokenPayload = jwtDecode(token);
            this.role.set(decoded.role);
        }
    }    

    logout() {
        localStorage.removeItem('token');
        this.role.set(null);
    }
}