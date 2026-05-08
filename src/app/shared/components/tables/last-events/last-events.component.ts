
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AlertManagerService } from '../../../services/alert-manager.service';
import { ServerAlert } from '../../../interfaces/alert';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-last-events',
  imports: [
    CommonModule,
    BadgeComponent
],
  templateUrl: './last-events.component.html',
  styles: ``
})
export class LastEventsComponent implements OnInit, OnDestroy {
    @Input() serverId: number = 1; // ID del servidor a monitorear

    alerts: ServerAlert[] = [];
    isLoading: boolean = true;
    private destroy$ = new Subject<void>();

    constructor(private alertManager: AlertManagerService) {}

    ngOnInit() {
      console.log(`🔍 LastEventsComponent iniciado para servidor ${this.serverId}`);
      
      // Obtener alertas del servidor
      this.alertManager.getServerAlerts(this.serverId)
        .pipe(
          tap((alerts) => {
            console.log(`📊 Recibidas ${alerts.length} alertas para servidor ${this.serverId}`, alerts);
            this.isLoading = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((alerts: ServerAlert[]) => {
          // Mostrar solo las últimas 10 alertas, ordenadas por timestamp descendente
          this.alerts = alerts
            .sort((a: ServerAlert, b: ServerAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
          console.log(`✅ Mostrando ${this.alerts.length} alertas en la UI`);
        });
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }

    getBadgeColor(tipo: string): 'success' | 'warning' | 'error' {
    if (tipo === 'CRITICAL') return 'error';
    if (tipo === 'WARNING') return 'warning';
    return 'success'; // INFO
  }

  getRecursoColor(recurso: string): string {
    const colors: { [key: string]: string } = {
      'CPU': '#ff6b6b',
      'RAM': '#4ecdc4',
      'DISCO': '#ffa502',
      'RED': '#6c5ce7',
      'CONECTIVIDAD': '#00b894',
      'GENERAL': '#95a5a6'
    };
    return colors[recurso] || '#95a5a6';
  }

  formatTimestamp(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return d.toLocaleDateString();
  }
}
