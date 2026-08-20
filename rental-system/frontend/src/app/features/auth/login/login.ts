import { Component, ChangeDetectorRef  } from '@angular/core'; // ChangeDetectorRef — ręczne odświeżanie widoku 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../core/current-user/auth.user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  // Dane formularza logowania
  formData = {
    email: '',
    password: '',
  };

  errorMessage = '';

  // Otrzymujemy HttpClient przez Angular
  constructor(private http: HttpClient, private cd: ChangeDetectorRef, private router: Router, private userService: UserService) { }

  // Wysyłanie formularza do backendu
  onSubmit() {
    this.http.post('http://localhost:3000/api/auth/login', this.formData)
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);  // Zapisujemy token w pamięci przeglądarki
          console.log('Zalogowano:', response); // jak długo łoguje
          this.userService.updateRole(); // aktualizujemy rolę użytkownika w serwisie 
          this.errorMessage = '';
          // Przekierowanie na stronę główną po zalogowaniu
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Błąd logowania';
          this.cd.detectChanges(); // odświeża strone odrazu
        }
      });
  }
}