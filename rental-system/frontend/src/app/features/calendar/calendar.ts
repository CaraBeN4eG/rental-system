import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // dla checkbox
import { HttpClient } from '@angular/common/http';

interface CalendarDay {
  date: Date;
  isOtherMonth: boolean;
  occupied: number[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  // spisy danych z backendu 
  equipmentList = signal<any[]>([]);     // [{id, name, checked, color}]
  rentals = signal<any[]>([]);           // [{id, equipmentId, startDate, expectedEnd}]
  calendarDays = signal<any[]>([]);      // [{date, isOtherMonth, occupied: []}]
  // potoczne daty 
  currentYear = signal<number>(new Date().getFullYear());
  currentMonth = signal<number>(new Date().getMonth());
  // statyczne nazwy dni tygodnia i miesięcy
  weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
  monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>('http://localhost:3000/api/equipment')
      .subscribe({
        next: (list) => {
          const formated = list.map((item, index) =>
          ({
            id: item.id,
            name: item.name,
            checked: true, // odrazy wszystko widzimy
            color: this.generateColor(index, list.length)
          }));
          this.equipmentList.set(formated)
          // żeby uniknąć rozbiegu odpowiedzi przez asynchronne funkcję
          if (this.rentals().length > 0) this.generateCalendarDays();

        },
        error: (err) => console.error('Błąd ładowania sprzętu', err)
      });

    this.http.get<any[]>('http://localhost:3000/api/rentals')
      .subscribe({
        next: (list) => {
          const formated = list.map((rent) =>
          ({
            id: rent.id,
            equipmentIds: rent.rentalItems.map((i: any) => i.equipmentId),
            startDate: rent.startDate,
            expectedEnd: rent.expectedEnd
          }));
          this.rentals.set(formated);
          // żeby uniknąć rozbiegu odpowiedzi przez asynchronne funkcję
          if (this.equipmentList().length > 0) this.generateCalendarDays();
        },
        error: (err) => console.error('Błąd ładowania wypożyczenia', err)
      });
  }

  generateCalendarDays() {
    const firstDay = new Date(this.currentYear(), this.currentMonth(), 1);
    const weekday = (firstDay.getDay() + 6) % 7; // getDay(): 0 = niedziela ... 6 = sobota
    const alignStart = weekday;
    const daysCount = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();
    const alignfinish = 42 - (alignStart + daysCount); // bo 42 krotki w kalendarze

    const days: CalendarDay[] = [];
    // Dni poprzedniego miesiąca
    const prevMonthLastDay = new Date(this.currentYear(), this.currentMonth(), 0).getDate();
    const prevYear = this.currentMonth() === 0 ? this.currentYear() - 1 : this.currentYear();
    for (let i = alignStart - 1; i >= 0; i--) {
      const day = new Date(prevYear, this.currentMonth() - 1, prevMonthLastDay - i);
      days.push({
        date: day,
        isOtherMonth: true,
        occupied: []
      });
    }
    // Dni potocznego miesiąca
    for (let i = firstDay.getDate(); i <= daysCount; i++) {
      const day = new Date(this.currentYear(), this.currentMonth(), i);
      days.push({
        date: day,
        isOtherMonth: false,
        occupied: []
      });
    }
    // Dni następnego miesiąca
    const nextYear = this.currentMonth() === 11 ? this.currentYear() + 1 : this.currentYear();
    for (let i = 1; i <= alignfinish; i++) {
      const day = new Date(nextYear, this.currentMonth() + 1, i);
      days.push({
        date: day,
        isOtherMonth: true,
        occupied: []
      });
    }
    const rentals = this.rentals();
    const equipments = this.equipmentList();

    for (const day of days) // idziemy dniami
    {
      const occupiedDays: number[] = [];
      for (const rent of rentals) // patrzymy w spis wypożyczeń
      {
        const from = new Date(rent.startDate);
        const to = new Date(rent.expectedEnd);
        if (day.date >= from && day.date <= to) // jeżeli dany dzień wpada w przedział wypożyczenia
          for (const eqId of rent.equipmentIds) // to szukamy którego sprzętu dotyczy
          {
            const eq = equipments.find(e => e.id == eqId) // bierzemy sprzęt o takim id
            if (eq && eq.checked) // jeżeli taki id znalieziono oraz ten sprzęt zaznaczony
            {
              occupiedDays.push(eqId) // zajmujemy ten dzień danym sprzętem
            }
          }
      }
      day.occupied = occupiedDays;
    }
    this.calendarDays.set(days);
  }
  getMonthLabel() {
    return this.monthNames[this.currentMonth()] + ' ' + this.currentYear();
  }
  prevMonth() {
    const curM = this.currentMonth();
    const curY = this.currentYear();

    if (curM === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(curY - 1);
    }
    else {
      this.currentMonth.set(curM - 1);
    }
    this.generateCalendarDays();
  }
  nextMonth() {
    const curM = this.currentMonth();
    const curY = this.currentYear();

    if (curM === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(curY + 1);
    }
    else {
      this.currentMonth.set(curM + 1);
    }
    this.generateCalendarDays();
  }
  generateColor(index: number, total: number) {
    const hue = (index / total) * 360;  // równomierne rozmieszczenie sektorów kolorów
    const sat = 70;                     // nasycenie
    const light = 58;                   // jasność
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  }
  toggleEquipment(id: string) {
    const updated = this.equipmentList().     // zapisujemy spis, który wraca funkcja signals
      map(item =>                               // tworzymy nową tablicę, z obiektem item
        item.id === id                          // gdy znaleźliśmy szukany element
          ? { ...item, checked: !item.checked } // odwracamy wartość jego checked
          : item
      );

    this.equipmentList.set(updated);          // odświeżamy cały spis sprzętu
    this.generateCalendarDays();              // odświeżamy kalendarz
  }

  getColor(equipmentId: string): string {
    const eq = this.equipmentList().find(e => e.id === equipmentId);
    return eq ? eq.color : 'transparent';
  }
  toggleAll(check: boolean) {
    const updated = this.equipmentList().
      map(item => ({
        ...item,
        checked: check
      }));
    // встановити checked для всіх
    this.equipmentList.set(updated);
    this.generateCalendarDays();
  }
  isAllChecked() {
    return this.equipmentList().every(e => e.checked === true);
  }
}
