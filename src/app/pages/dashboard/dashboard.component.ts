import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CardNumberComponent } from '../../shared/components/cards/card-number/card-number.component';
import { ServerService } from '../../shared/services/server.service';
import { ServerAlert } from '../../shared/interfaces/alert';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';
import { formatTimestamp } from '../../core/format';
import { AlertListenerService, ServerMetricsSnapshot } from '../../shared/services/alert-listener.service';

interface DashboardServerMetric extends ServerMetricsSnapshot {}

@Component({
  selector: 'app-dashboard',
  imports: [
    ComponentCardComponent,
    CardNumberComponent,
    CommonModule,
    LastEventsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  lastUpdate: Date = new Date();
  servers: DashboardServerMetric[] = []
  cpuMean: number = 0;
  ramMean: number = 0;
  recentAlertsCount: number = 0;
  private destroy$ = new Subject<void>();
  private knownServerIds = new Set<number>();

  constructor(
    private serverService: ServerService,
    private alertListener: AlertListenerService
  ) {}

  async ngOnInit() {
    this.alertListener.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe((servers) => {
        this.servers = servers;
        this.lastUpdate = servers[0]?.timestamp ?? new Date();
        this.calculateMeans();
        void this.preloadAlertsForKnownServers(servers);
      });

    this.serverService.getAllCriticalAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((alerts) => {
        this.updateRecentAlertsCount(alerts);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async preloadAlertsForKnownServers(servers: DashboardServerMetric[]) {
    const newServerIds = servers
      .map((server) => server.serverId)
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

  private updateRecentAlertsCount(alerts: ServerAlert[]) {
    this.lastUpdate = new Date();

    const cutoff = Date.now() - 60 * 60 * 1000;
    this.recentAlertsCount = alerts
      .filter((alert) => new Date(alert.timestamp).getTime() >= cutoff)
      .length;
  }

  private calculateMeans() {
    if (this.servers.length === 0) {
      this.cpuMean = 0;
      this.ramMean = 0;
      return;
    }

    const totalCpu = this.servers.reduce((sum, server) => sum + server.cpu, 0);
    const totalRam = this.servers.reduce((sum, server) => sum + server.ram, 0);

    this.cpuMean = Math.round(totalCpu / this.servers.length);
    this.ramMean = Math.round(totalRam / this.servers.length);

    this.lastUpdate = new Date();
  }

  formatTimestamp(date: Date | string): string {
    return formatTimestamp(date);
  }
}
