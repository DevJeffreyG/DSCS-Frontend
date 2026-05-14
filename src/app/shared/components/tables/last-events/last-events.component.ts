
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { AlertManagerService } from '../../../services/alert-manager.service';
import { ServerService } from '../../../services/server.service';
import { ServerAlert } from '../../../interfaces/alert';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { formatTimestamp } from '../../../../core/format';
import { AlertListenerService, ServerMetricsSnapshot } from '../../../services/alert-listener.service';

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
    @Input() allServers: boolean = false; // Mostrar alertas de TODOS los servidores
    @Input() showResolveButton: boolean = false; // Mostrar botón para resolver alertas

    alerts: ServerAlert[] = [];
    serverMap: Record<number, string> = {}; // id -> nombre
    isLoading: boolean = true;
    private destroy$ = new Subject<void>();
    private knownServerIds = new Set<number>();

    constructor(
      private alertManager: AlertManagerService,
      private serverService: ServerService,
      private alertListener: AlertListenerService
    ) {}

    ngOnInit() {
      console.log(`🔍 LastEventsComponent iniciado for serverId=${this.serverId} allServers=${this.allServers}`);

      if (this.allServers) {
        this.alertListener.metrics$
          .pipe(takeUntil(this.destroy$))
          .subscribe((metrics: ServerMetricsSnapshot[]) => {
            metrics.forEach((metric) => {
              this.serverMap[metric.serverId] = metric.nombre;
            });

            void this.preloadAlertsForKnownServers(metrics);
          });

        // Suscribirse al mapa global de alertas y combinar todas las alertas
        this.alertManager.activeAlerts$
          .pipe(takeUntil(this.destroy$))
          .subscribe((cache) => {
            const allAlerts = Array.from(cache.values()).flat();
            this.alerts = allAlerts
              .sort((a: ServerAlert, b: ServerAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            this.isLoading = false;
            console.log(`✅ Mostrando ${this.alerts.length} alertas (todos los servidores)`);
          });
      } else {
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
            console.log(`✅ Mostrando ${this.alerts.length} alertas en la UI`);
          });
      }
    }

    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }

    private async preloadAlertsForKnownServers(metrics: ServerMetricsSnapshot[]) {
      const newServerIds = metrics
        .map((metric) => metric.serverId)
        .filter((serverId) => {
          if (this.knownServerIds.has(serverId)) {
            return false;
          }

          this.knownServerIds.add(serverId);
          return true;
        });

      if (newServerIds.length > 0) {
        await this.serverService.preloadServerAlertsByIds(newServerIds);
      }
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
    return formatTimestamp(date)
  }

  resolveAlert(alertId: string): void {
    console.log(`🔧 Resolviendo alerta ${alertId}...`);
    this.alertManager.resolveAlert(alertId).subscribe(
      () => {
        console.log(`✅ Alerta ${alertId} resuelta`);
      },
      (error) => {
        console.error(`❌ Error resolviendo alerta ${alertId}:`, error);
      }
    );
  }
}
