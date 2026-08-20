import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ClientForm } from '../client-form/client-form';
import { UserService } from '../../core/current-user/auth.user.service';

@Component({
  selector: 'app-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientForm],
  templateUrl: './rentals.html',
  styleUrls: ['./rentals.css'],
})
export class Rentals implements OnInit {
  // dane z backendu jako signal dla natychmiastowego odświeżania
  clients = signal<any[]>([]);
  availableEquipment = signal<any[]>([]);
  rentals = signal<any[]>([]);

  // lokalne zmienne do przechowywania wybranych wartości w formularzu
  selectedEquipmentIds: string[] = [];
  selectedClientId: string | null = null;
  startDate: string = '';
  expectedEnd: string = '';

  // Stany listy rozwijanej
  expandedRentalId: string | null = null; // które wypożyczenie rozwarte: s lub nic (null)
  returnFormData: Record<string, Record<string, { condition: string; status: string }>> = {}; // { [rentalId]: { [equipmentId]: {condition, status} } }

  // modalne okno utworzenia konta klienta
  showClientModal = signal<boolean>(false);

  constructor(private http: HttpClient, public userService: UserService) { }

  ngOnInit() {
    if (this.userService.role() !== 'CLIENT') {
      this.http.get<any[]>('http://localhost:3000/api/clients').subscribe(data => {
        console.log('CLIENTS FROM BACKEND', data);
        this.clients.set(data);
      });
    }


    this.http.get<any[]>('http://localhost:3000/api/equipment')
      .subscribe({
        next: (data) => {
          console.log('EQUIPMENT FROM BACKEND', data);

          const arr = Array.isArray(data) ? data : [];
          const available = arr.filter(e => {
            const status = (e?.status ?? '').toString().trim().toUpperCase();
            return status === 'AVAILABLE';
          });
          this.availableEquipment.set(available);
        }
      });

    this.http.get<any[]>('http://localhost:3000/api/rentals').subscribe(data => {
      console.log('RENTALS FROM BACKEND', data);
      this.rentals.set(data);
    });
  }

  toggleEquipmentSelection(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (checked) this.selectedEquipmentIds.push(id);
    else this.selectedEquipmentIds = this.selectedEquipmentIds.filter(x => x !== id);
  }

  canSubmit() {
    const base =
      this.selectedEquipmentIds.length > 0 &&
      !!this.startDate &&
      !!this.expectedEnd;

    if (this.userService.role() === 'CLIENT') { return base; }
    return base && !!this.selectedClientId;
  }


  createRental() {
    const body: any = {
      equipmentIds: this.selectedEquipmentIds,
      startDate: this.startDate,
      expectedEnd: this.expectedEnd
    };

    if (this.userService.role() !== 'CLIENT' && this.selectedClientId) // bez "..&& this.selectedClientId" front wysyła 'undefined' (.optional() dopuszca) zamiast 'null' i backend wyrzuca custom błąd
      body.clientId = this.selectedClientId;

    this.http.post('http://localhost:3000/api/rentals', body)
      .subscribe({
        next: () => {
          this.http.get<any[]>('http://localhost:3000/api/rentals')
            .subscribe({ next: (data) => this.rentals.set(data) });
        },
        error: (err) => {
          if (err.error?.code === 'CLIENT_PROFILE_MISSING') {
            this.showClientModal.set(true);
            return;
          }
          console.error('Unexpected error:', err);
        }
      });
  }

  onClientCreated(client: any) {
    this.showClientModal.set(false);
    this.createRental(); // powtarzamy próbę utworzenia wypożyczenia po dodanym koncie
  }

  onClientCancelled() {
    this.showClientModal.set(false);
  }

  toggleExpand(rental: any) {
    if (this.expandedRentalId === rental.id) {
      this.expandedRentalId = null;
      return;
    }
    this.expandedRentalId = rental.id;

    if (!this.returnFormData[rental.id]) {
      const itemsData: Record<string, { condition: string; status: string }> = {};
      for (const item of rental.rentalItems) {
        itemsData[item.equipmentId] = { condition: '', status: 'AVAILABLE' };
      }
      this.returnFormData[rental.id] = itemsData;
    }
  }

  returnRental(id: string) {
    const itemsData = this.returnFormData[id] ?? {};
    const items = Object.keys(itemsData).map(equipmentId => ({
      equipmentId,
      condition: itemsData[equipmentId].condition,
      status: itemsData[equipmentId].status,
    }));

    this.http.put(`http://localhost:3000/api/rentals/${id}/return`, { items })
      .subscribe(() => {
        this.http.get<any[]>('http://localhost:3000/api/rentals').subscribe(data => { this.rentals.set(data); });
      });
  }
}