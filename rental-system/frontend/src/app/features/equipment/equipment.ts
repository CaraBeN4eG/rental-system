import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core'; // signal — kontener na wartość, który sam powiadamia Angular o zmianie
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equipment',
  imports: [FormsModule, CommonModule],
  templateUrl: './equipment.html',
  styleUrl: './equipment.css',
})
export class Equipment implements OnInit { // punkt startowy i informacja z jakim komponentem mamy do czynienia
  equipmentList = signal<any[]>([]);
  categories = signal<any[]>([]);
  newCategName: string = '';
  showCategoryForm: boolean = false;

  formData =
    {
      name: '',
      description: '',
      serialNumber: '',
      dailyRate: 0,
      depositAmount: 0,
      categoryId: ''
    }
  
  constructor(private http: HttpClient) { }
  
  // Pobieranie danych przy otwarciu strony
  ngOnInit() {
    this.loadEquipment();
    this.loadCategories();
  }

  // Osobna funkcja żeby nie powtarzać kodu
  loadEquipment() { this.http.get<any[]>('http://localhost:3000/api/equipment').subscribe(data => this.equipmentList.set(data)); } // .set() jawnie powiadamia Angular — to jest "trigger" change detection,
  // Dodawanie nowego sprzętu
  addEquipment() {
    this.http.post('http://localhost:3000/api/equipment', this.formData).subscribe({ // zamierzam napisać listę do serwera
      next: (response: any) => {                                                     // rzucam do jego pocztowej skrzynki, oczekując `any`
        this.loadEquipment(); // Odświeżanie listy sprzętu po dodaniu
        console.log('Dodano sprzęt:', response);
      },
      error: (err) => { console.error('Błąd dodawania sprzętu:', err); }
    }
    );
  }
canSubmit(): boolean {
  return !!(
    this.formData.name.trim() &&
    this.formData.dailyRate > 0 &&
    this.formData.categoryId
  );
}
  // Usuwanie sprzętu
  onDelete(id: string) {
    this.http.delete(`http://localhost:3000/api/equipment/${id}`).subscribe
      ({
        next: (response: any) => {
          console.log('Usunięto sprzęt:', response);
          this.loadEquipment(); // Odświeżanie listy sprzętu po usunięciu
        },
        error: (err) => {
          console.error('Błąd dodawania sprzętu:', err);
        }
      });
  }

  loadCategories() { this.http.get<any[]>('http://localhost:3000/api/categories').subscribe(data => this.categories.set(data)); } // .set() jawnie powiadamia Angular — to jest "trigger" change detection,
  toggleCategoryForm() { this.showCategoryForm = !this.showCategoryForm; }
  addCategory() {
    if (!this.newCategName || !this.newCategName.trim()) {
      alert("Nazwa kategorii nie może być pusta");
      return;
    }

    console.log('Dodawanie kategorii:', this.newCategName);
    this.http.post('http://localhost:3000/api/categories', { name: this.newCategName }).subscribe({
      next: (response: any) => {
        console.log('Dodano kategorię:', response);
        this.loadCategories();
        this.newCategName = ''; // czyszczenie pola po dodaniu
        this.showCategoryForm = false; // ukrycie formularza po dodaniu
      },
      error: (err) => { console.error('Błąd dodawania kategorii:', err); }
    });
  }
}