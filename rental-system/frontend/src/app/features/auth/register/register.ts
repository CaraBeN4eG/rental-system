import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  // Dane formularza rejestracji
  formData = {
    email: '',
    password: '',
    role: 'CLIENT'
  };

  errorMessage = '';

  // Otrzymujemy HttpClient przez Angular
  constructor(private http: HttpClient, private router: Router) {}

  // Wysyłanie formularza do backendu
  onSubmit() {
    this.http.post('http://localhost:3000/api/auth/register', this.formData)
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          console.log('Rejestracja udana:', response);
          this.errorMessage = '';
          this.router.navigate(['/dashboard']); // rejestracja udana - przekierowujemy do dashboard
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Błąd rejestracji';
        }
      });
  }
}