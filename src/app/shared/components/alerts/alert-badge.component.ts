import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ServerAlert } from '../../interfaces/alert';
import { ServerService } from '../../services/server.service';

@Component({
  selector: 'app-alert-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-badge" [ngClass]="{ connected: isConnected$ | async }">
      <!-- Indicador de alertas críticas -->
      <div
        class="badge-critical"
        *ngIf="(criticalCount$ | async) as count"
        [ngClass]="{ 'has-alerts': count > 0 }"
      >
        <span class="count">{{ count }}</span>
        <span class="label">Críticas</span>
      </div>

      <!-- Indicador de advertencias -->
      <div
        class="badge-warning"
        *ngIf="(warningCount$ | async) as count"
        [ngClass]="{ 'has-alerts': count > 0 }"
      >
        <span class="count">{{ count }}</span>
        <span class="label">Advertencias</span>
      </div>

      <!-- Última alerta -->
      <div class="last-alert" *ngIf="lastAlert$ | async as alert">
        <span class="time">{{ alert.timestamp | date : 'short' }}</span>
        <span class="message" [title]="alert.mensaje">{{ alert.mensaje }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .alert-badge {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 10px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .alert-badge.connected {
        border-top: 3px solid #4caf50;
      }

      .alert-badge:not(.connected) {
        border-top: 3px solid #d32f2f;
        opacity: 0.7;
      }

      .badge-critical,
      .badge-warning {
        padding: 8px;
        border-radius: 4px;
        text-align: center;
      }

      .badge-critical {
        background: #ffebee;
      }

      .badge-critical.has-alerts {
        background: #ffcdd2;
        color: #b71c1c;
        font-weight: 600;
      }

      .badge-warning {
        background: #fffde7;
      }

      .badge-warning.has-alerts {
        background: #fff9c4;
        color: #f57f17;
        font-weight: 600;
      }

      .count {
        display: block;
        font-size: 20px;
        font-weight: 700;
      }

      .label {
        display: block;
        font-size: 11px;
        margin-top: 2px;
      }

      .last-alert {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 12px;
      }

      .time {
        color: #999;
      }

      .message {
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
    `,
  ],
})
export class AlertBadgeComponent implements OnInit, OnDestroy {
  @Input() serverId: number = 0;

  criticalCount$!: Observable<number>;
  warningCount$!: Observable<number>;
  lastAlert$!: Observable<ServerAlert | undefined>;
  isConnected$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(private serverService: ServerService) {}

  ngOnInit() {
    if (this.serverId) {
      this.criticalCount$ = this.serverService.getServerAlerts(this.serverId).pipe(
        takeUntil(this.destroy$),
        map(alerts => alerts.filter(a => a.tipo === 'CRITICAL').length)
      );

      this.warningCount$ = this.serverService.getServerAlerts(this.serverId).pipe(
        takeUntil(this.destroy$),
        map(alerts => alerts.filter(a => a.tipo === 'WARNING').length)
      );

      this.lastAlert$ = this.serverService.getServerAlerts(this.serverId).pipe(
        takeUntil(this.destroy$),
        map(alerts => alerts[0])
      );

      this.isConnected$ = this.serverService.isAlertListenerConnected$();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
