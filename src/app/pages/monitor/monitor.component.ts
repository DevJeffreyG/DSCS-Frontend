import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Server } from '../../shared/interfaces/server';
import { UsageChartComponent } from '../../shared/components/charts/usage/usage-chart.component';
import { MonitorType } from '../../shared/enums/monitor-type';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AlertListenerService, ServerMetricsSnapshot } from '../../shared/services/alert-listener.service';
import { formatTimestamp } from '../../core/format';

@Component({
  selector: 'app-monitor',
  imports: [
    UsageChartComponent,
    LastEventsComponent,
    CommonModule
  ],
  templateUrl: './monitor.component.html',
})
export class MonitorComponent implements OnInit, OnDestroy {
  server: Server | null;
  lastUpdated: Date = new Date();
  MonitorType = MonitorType;
  private destroy$ = new Subject<void>();

  constructor(
    router: Router,
    private alertListener: AlertListenerService
  ){
    if(router.currentNavigation()?.extras.state) {
      const server = router.currentNavigation()?.extras.state?.['server'];   
      this.server = server;
    } else {
      this.server = null;
      router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    if (!this.server) {
      return;
    }

    this.alertListener.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe((metrics: ServerMetricsSnapshot[]) => {
        const currentServer = metrics.find((metric) => metric.serverId === this.server?.id);

        if (currentServer) {
          this.lastUpdated = currentServer.timestamp;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatTimestamp(date: Date | string): string {
    return formatTimestamp(date);
  }
}