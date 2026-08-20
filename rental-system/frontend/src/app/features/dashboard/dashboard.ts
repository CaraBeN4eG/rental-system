import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {UserService} from '../../core/current-user/auth.user.service';
import { CommonModule } from '@angular/common';

// "walidacja danych wejściowych: schematy Zod zdefiniowane, ale nie wymuszane (uproszczenie MVP)"

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  // userId = '';
  role = '';

  constructor(private router: Router, public userService: UserService) { }
// jak main - punkt wejścia do aplikacji
  ngOnInit() {
    // Pobieramy token z localStorage i wyciągamy email
    const token = localStorage.getItem('token');
    if (!token) {
      // Brak tokenu — wróć do logowania
      this.router.navigate(['/login']);
      return;
    }

    // Dekodujemy token (środkowa część to dane)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // this.userId = payload.userId;
    this.role = payload.role;
  }

  logout() {
    // Usuwamy token i wracamy do logowania
    localStorage.removeItem('token');
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}