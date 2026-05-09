import { Component, OnDestroy } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CardNumberComponent } from '../../shared/components/cards/card-number/card-number.component';
import { Server } from '../../shared/interfaces/server';
import { ServerService } from '../../shared/services/server.service';
import { ServerAlert } from '../../shared/interfaces/alert';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';

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
export class DashboardComponent {
  lastUpdate: Date = new Date();
  servers: Server[] = []
  cpuMean: number = 0;
  ramMean: number = 0;
  recentAlertsCount: number = 0;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  private destroy$ = new Subject<void>();

  constructor(private serverService: ServerService) {}

  async ngOnInit() {
    await this.loadInitialData();

    this.refreshIntervalId = setInterval(() => {
      void this.refreshAverageMetrics();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadInitialData() {
    this.servers = await this.serverService.getAllServers();
    await this.serverService.preloadServerAlerts(this.servers);

    this.serverService.getAllCriticalAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((alerts) => {
        this.updateRecentAlertsCount(alerts);
      });

    this.calculateMeans();
  }

  private async refreshAverageMetrics() {
    this.servers = await this.serverService.getAllServers();
    this.calculateMeans();
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
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return `Hace ${diffSecs} segundo${diffSecs === 1 ? '' : 's'}`;
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;

    return d.toLocaleDateString();
  }
}
