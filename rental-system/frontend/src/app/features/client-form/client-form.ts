import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-client-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './client-form.html',
    styleUrls: ['./client-form.css'],
})
export class ClientForm {

    // Dane formularza klienta
    formData = {
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    };

    errorMessage = '';

    // dla możliwości utworzenia konta klienta w modalnym oknie
    @Output() clientCreated = new EventEmitter<any>();    // wydarzenie - utworzenie
    @Output() cancelled = new EventEmitter<void>();       // wydarzenie - kasowanie

    constructor(private http: HttpClient) { }

    // Wysyłanie formularza do backendu
    onSubmit() {
        this.errorMessage = '';

        this.http.post('http://localhost:3000/api/clients/me', this.formData)
            .subscribe({
                next: (newClient) => {
                    console.log('Klient utworzony:', newClient);
                    this.clientCreated.emit(newClient);
                },
                error: (err) => {
                    this.errorMessage = err.error.message || 'Błąd utworzenia klienta';
                }
            });
    }

    cancel() {
        this.cancelled.emit();
    }
}