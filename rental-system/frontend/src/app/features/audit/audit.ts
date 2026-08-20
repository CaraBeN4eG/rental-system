import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core'; // signal — kontener na wartość, który sam powiadamia Angular o zmianie
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-audit',
    imports: [FormsModule, CommonModule],
    templateUrl: './audit.html',
    styleUrl: './audit.css',
})
export class Audit implements OnInit {
    logs = signal<any[]>([]);
    // opcje rozwijanej listy
    entities: string[] = ['', 'EQUIPMENT_SERVICE', 'EQUIPMENT', 'CATEGORY', 'RENTAL', 'USER', 'CLIENT'];
    actions: string[] = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'];
    // która ocja aktualnie aktywna
    selectedEntity = signal<string>('');
    selectedAction = signal<string>('');

    // jeden rozwinięty log jednocześnie
    expandedLogId: string | null = null;

    auditFields =
        {
            userId: '',
            rentalId: '',
            entityId: '',
        }

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadLogs();
    }
    private safeJsonParse(value: string | null): any {
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
    public toggleExpand(log: any) {
        this.expandedLogId = this.expandedLogId === log.id ? null : log.id;
    }

    loadLogs() {
        let params = new HttpParams();
        // unikamy null przy przypisywaniu
        params = (this.auditFields.userId) ? params.set('userId', this.auditFields.userId) : params;
        params = (this.selectedAction()) ? params.set('action', this.selectedAction()) : params;
        params = (this.selectedEntity()) ? params.set('entityType', this.selectedEntity()) : params;
        params = (this.auditFields.rentalId) ? params.set('rentalId', this.auditFields.rentalId) : params;
        params = (this.auditFields.entityId) ? params.set('entityId', this.auditFields.entityId) : params;

        this.http.get<any[]>('http://localhost:3000/api/audit', { params }).subscribe({
            next: data => {
                const parsedData = data.map(log =>
                ({
                    ...log, // spread-function: resztę pól kopijuje
                    oldData: this.safeJsonParse(log.oldData),
                    newData: this.safeJsonParse(log.newData)
                }));
                console.log('LOGS FROM BACKEND', data);
                console.log('PARSED LOGS FROM BACKEND', parsedData);
                // this.logs.set(data);
                this.logs.set(parsedData);
            },
            error: err => console.error('BŁĄD ładowania logów audytu', err)
        });
    }
}