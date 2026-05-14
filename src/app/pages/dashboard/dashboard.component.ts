import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CardNumberComponent } from '../../shared/components/cards/card-number/card-number.component';
import { Server } from '../../shared/interfaces/server';
import { ServerService } from '../../shared/services/server.service';
import { ServerAlert } from '../../shared/interfaces/alert';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';
import { formatTimestamp } from '../../core/format';

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
  servers: Server[] = []
  cpuMean: number = 0;
  ramMean: number = 0;
  recentAlertsCount: number = 0;
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  private destroy$ = new Subject<void>();
  private lastUpdatedSub?: Subscription;

  constructor(private serverService: ServerService) {}

  async ngOnInit() {
    this.lastUpdatedSub = this.serverService.getLastUpdated().subscribe((timestamp) => {
      this.lastUpdate = timestamp;
    });

    await this.loadInitialData();

    this.refreshIntervalId = setInterval(() => {
      void this.refreshAverageMetrics();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    this.lastUpdatedSub?.unsubscribe();
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
    return formatTimestamp(date);
  }
}
