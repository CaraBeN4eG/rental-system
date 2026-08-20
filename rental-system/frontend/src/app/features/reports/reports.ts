import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports implements OnInit {
  przeview = signal<any>(null); // dane z backendu jako signal dla natychmiastowego podglądu raportu
  isLoading = signal<boolean>(false); // blokuje przycisk generowania raportu podczas pobierania danych z backendu
  startDate: string = ''; dateTo: string = ''; // zmienne filtrujące dane do raportu
  
  constructor(private http: HttpClient) { }

  ngOnInit() { } // konieczny punkt wejścia
  canGenerate() { return this.startDate !== '' && this.dateTo !== ''; }
  loadPreview() {
    //    console.log('loadPreview called', { dateFrom: this.startDate, dateTo: this.dateTo, isLoading: this.isLoading });
    if (!this.canGenerate()) throw new Error('Nie można wygenerować raportu. Brak daty początkowej lub końcowej.');
    
    this.isLoading.set(true);

    this.http.get<any[]>('http://localhost:3000/api/reports/data', {
      params:
      {
        startDate: this.startDate,
        dateTo: this.dateTo
      }
    }).pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data: any[]) => this.przeview.set(data),
        error: (err) => {
          console.error('Błąd podczas ładowania podglądu raportu', err);
        }
      });
  }

  generateReport() {
    if (!this.canGenerate()) return;
    this.isLoading.set(true);

    this.http.get('http://localhost:3000/api/reports/generate', {
      params: { startDate: this.startDate, dateTo: this.dateTo },
      responseType: 'blob'  // to znaczy, że odpowiedź z backendu będzie w formie binarnej (plik PDF)
    }).pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);    // czasowy URL
          const a = document.createElement('a');   // skryty element <a> do pobrania pliku
          a.href = url;
          a.download = 'raport.pdf';              // domyślna nazwa pliku
          document.body.appendChild(a); // dodajemy element do DOM, żeby można było go kliknąć
          a.click();                              // klikamy link
          URL.revokeObjectURL(url);              // czyścimy URL po pobraniu
        },
        error: () => { this.isLoading.set(false); }
      });
  }
}
