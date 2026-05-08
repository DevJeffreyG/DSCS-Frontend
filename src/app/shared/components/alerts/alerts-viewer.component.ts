import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerAlert, AlertStats } from '../../interfaces/alert';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'app-alerts-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-container">
      <!-- Header con estadísticas -->
      <div class="alerts-header">
        <h3 class="text-xl font-bold">Alertas - Servidor {{ serverId }}</h3>
        <div class="alert-stats" *ngIf="stats$ | async as stats">
          <span class="stat critical">🔴 {{ stats.criticas }}</span>
          <span class="stat warning">🟡 {{ stats.advertencias }}</span>
          <span class="stat info">🔵 {{ stats.informativas }}</span>
          <span class="stat resolved">✅ {{ stats.resueltas }}</span>
        </div>
      </div>

      <!-- Estado de conexión -->
      <div
        class="connection-status"
        [ngClass]="{ connected: isConnected$ | async, disconnected: !(isConnected$ | async) }"
      >
        <span>{{ (isConnected$ | async) ? '🟢 Conectado' : '🔴 Desconectado' }}</span>
      </div>

      <!-- Lista de alertas -->
      <div class="alerts-list">
        <div
          *ngFor="let alert of alerts$ | async"
          class="alert-item"
          [ngClass]="alert.tipo.toLowerCase()"
        >
          <div class="alert-header">
            <span class="alert-icon">{{ getAlertIcon(alert.tipo) }}</span>
            <span class="alert-title">{{ alert.recurso }} - {{ alert.tipo }}</span>
            <span class="alert-time">{{ alert.timestamp | date : 'short' }}</span>
          </div>
          <div class="alert-body">
            <p class="alert-message">{{ alert.mensaje }}</p>
            <div class="alert-details" *ngIf="alert.valor !== undefined">
              <span>Valor: {{ alert.valor }}%</span>
              <span *ngIf="alert.umbral !== undefined">Umbral: {{ alert.umbral }}%</span>
            </div>
          </div>
          <div class="alert-actions">
            <button
              *ngIf="!alert.resuelto"
              (click)="resolveAlert(alert.id)"
              class="btn-resolve"
            >
              Resolver
            </button>
            <span *ngIf="alert.resuelto" class="resolved-badge">Resuelto</span>
          </div>
        </div>

        <!-- Mensaje si no hay alertas -->
        <div *ngIf="!(alerts$ | async)?.length" class="no-alerts">
          <p>No hay alertas activas</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .alerts-container {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .alerts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e0e0e0;
      }

      .alert-stats {
        display: flex;
        gap: 15px;
        font-size: 14px;
      }

      .stat {
        padding: 5px 10px;
        border-radius: 4px;
        font-weight: 600;
      }

      .stat.critical {
        background: #ffe0e0;
        color: #c00;
      }

      .stat.warning {
        background: #fff3cd;
        color: #856404;
      }

      .stat.info {
        background: #d1ecf1;
        color: #0c5460;
      }

      .stat.resolved {
        background: #d4edda;
        color: #155724;
      }

      .connection-status {
        padding: 10px 15px;
        border-radius: 4px;
        margin-bottom: 15px;
        font-weight: 600;
      }

      .connection-status.connected {
        background: #d4edda;
        color: #155724;
      }

      .connection-status.disconnected {
        background: #ffe0e0;
        color: #c00;
      }

      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .alert-item {
        background: white;
        border-left: 4px solid #999;
        border-radius: 4px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .alert-item.critical {
        border-left-color: #d32f2f;
        background: #ffebee;
      }

      .alert-item.warning {
        border-left-color: #f57f17;
        background: #fffde7;
      }

      .alert-item.info {
        border-left-color: #1976d2;
        background: #e3f2fd;
      }

      .alert-header {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;
        font-weight: 600;
      }

      .alert-icon {
        font-size: 20px;
      }

      .alert-title {
        flex: 1;
      }

      .alert-time {
        font-size: 12px;
        color: #666;
      }

      .alert-body {
        margin: 10px 0;
      }

      .alert-message {
        margin: 0 0 10px 0;
        color: #333;
      }

      .alert-details {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: #666;
      }

      .alert-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      .btn-resolve {
        padding: 5px 12px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s;
      }

      .btn-resolve:hover {
        background: #45a049;
      }

      .resolved-badge {
        padding: 5px 12px;
        background: #4caf50;
        color: white;
        border-radius: 4px;
        font-size: 12px;
      }

      .no-alerts {
        text-align: center;
        padding: 30px;
        color: #999;
      }
    `,
  ],
})
export class AlertsViewerComponent implements OnInit, OnDestroy {
  @Input() serverId: number = 0;

  alerts$!: Observable<ServerAlert[]>;
  stats$!: Observable<AlertStats>;
  isConnected$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(private serverService: ServerService) {}

  ngOnInit() {
    if (this.serverId) {
      this.alerts$ = this.serverService.getServerAlerts(this.serverId).pipe(
        takeUntil(this.destroy$)
      );

      this.stats$ = this.serverService.getAlertStats(this.serverId).pipe(
        takeUntil(this.destroy$)
      );

      this.isConnected$ = this.serverService.isAlertListenerConnected$().pipe(
        takeUntil(this.destroy$)
      );
    }
  }

  resolveAlert(alertId: string) {
    this.serverService.resolveAlert(alertId).subscribe(
      () => {
        console.log(`✅ Alerta ${alertId} resuelta`);
      },
      (err) => {
        console.error('Error resolviendo alerta:', err);
      }
    );
  }

  getAlertIcon(tipo: string): string {
    switch (tipo) {
      case 'CRITICAL':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'INFO':
        return '🔵';
      default:
        return '•';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
