import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.html',
    styleUrls: ['./users.css'],
})
export class Users implements OnInit {
    users = signal<any[]>([]);

    searchData: string = '';

    editingUserId = signal<string | null>(null); // który wiersz jest edytowany
    editEmail: string = '';
    editRole: string = '';
    editPassword: string = '';

    userData = { email: '', password: '', role: 'CLIENT' };

    // errorMessage: string = '';
    errorMessage = signal<string>('');

    constructor(private http: HttpClient) { }
    // Ogólne
    ngOnInit() {
        this.loadUsers();
    }
    loadUsers() {
        this.http.get<any[]>('http://localhost:3000/api/users').subscribe(data => {
            console.log('USERS FROM BACKEND', data);
            this.users.set(data);
        });
    }
    public isFormValid(email: string, role: string, password: string): boolean {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        const roleValid = ['CLIENT', 'EMPLOYEE', 'ADMIN'].includes(role);
        const passwordValid = (password.length === 0 && this.editingUserId() !== null) || password.length >= 8;
        // console.log(!emailValid ? 'email!' : '', !roleValid ? 'role!' : '', !passwordValid ? 'password!' : '');
        return emailValid && passwordValid && roleValid;
    }

    // Wyszukiwanie
    findUser() {
        if (!this.searchData) { this.loadUsers(); return; }
        const isEmail = this.searchData.includes('@');
        const url = isEmail
            ? `http://localhost:3000/api/users/email/${this.searchData}`
            : `http://localhost:3000/api/users/id/${this.searchData}`;

        this.http.get<any>(url).subscribe({
            next: (data) => this.users.set([data]),
            error: () => this.users.set([])
        });
    }
    clearSearch() {
        this.searchData = '';
        this.loadUsers();
    }
    // Modyfikacja
    updateUser(id: string) {
        const data: { email: string; role: string; password?: string } = {
            email: this.editEmail,
            role: this.editRole
        };
        if (this.editPassword) data.password = this.editPassword;

        this.errorMessage.set('');
        this.http.put<any>(`http://localhost:3000/api/users/${id}`, data)
            .subscribe({
                next: () => { this.cancelEdit(); this.loadUsers(); },
                error: (err) => this.errorMessage.set(err.error?.message ?? 'Wystąpił błąd')
            });
    }
    startEdit(user: any) {
        this.editingUserId.set(user.id);
        this.editEmail = user.email;
        this.editRole = user.role;
        this.editPassword = '';
    }
    cancelEdit() {
        this.editingUserId.set(null);
        this.editEmail = '';
        this.editRole = '';
        this.editPassword = '';
    }

    createUser() {
        this.errorMessage.set('');
        this.http.post<any>('http://localhost:3000/api/users', this.userData).subscribe({
            next: () => {
                this.userData = { email: '', password: '', role: 'CLIENT' };
                this.loadUsers();
            },
            error: (err) => this.errorMessage.set(err.error?.message ?? 'Wystąpił błąd')
        });
    }
    deleteUser(id: string) {
        if (!confirm('Na pewno usunąć tego użytkownika?')) return;

        this.errorMessage.set('');
        this.http.delete(`http://localhost:3000/api/users/${id}`).subscribe({
            next: () => this.loadUsers(),
            error: (err) => this.errorMessage.set(err.error?.message ?? 'Wystąpił błąd')
        });
    }
}