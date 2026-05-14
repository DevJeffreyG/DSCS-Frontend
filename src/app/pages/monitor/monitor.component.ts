import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Server } from '../../shared/interfaces/server';
import { UsageChartComponent } from '../../shared/components/charts/usage/usage-chart.component';
import { MonitorType } from '../../shared/enums/monitor-type';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';
import { CommonModule } from '@angular/common';
import { ServerService } from '../../shared/services/server.service';
import { Subscription } from 'rxjs';
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
  private lastUpdatedSub?: Subscription;

  constructor(
    router: Router,
    private serverService: ServerService
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
    this.lastUpdatedSub = this.serverService.getLastUpdated().subscribe(
      timestamp => {
        this.lastUpdated = timestamp;
      }
    );
  }

  ngOnDestroy(): void {
    this.lastUpdatedSub?.unsubscribe();
  }

  formatTimestamp(date: Date | string): string {
    return formatTimestamp(date);
  }
}