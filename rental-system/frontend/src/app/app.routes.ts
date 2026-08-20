import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register';
import { LoginComponent } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Equipment } from './features/equipment/equipment';
import { Rentals } from './features/rentals/rentals';
import { Reports } from './features/reports/reports';
import { Calendar } from './features/calendar/calendar';
import { Users } from './features/users/users';
import { Audit } from './features/audit/audit';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'equipment', component: Equipment },
  { path: 'rentals', component: Rentals },
  { path: 'reports', component: Reports },
  { path: 'calendar', component: Calendar },
  { path: 'users', component: Users },
  { path: 'audit', component: Audit },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];