import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Server } from '../../shared/interfaces/server';
import { UsageChartComponent } from '../../shared/components/charts/usage/usage-chart.component';
import { MonitorType } from '../../shared/enums/monitor-type';
import { LastEventsComponent } from '../../shared/components/tables/last-events/last-events.component';

@Component({
  selector: 'app-monitor',
  imports: [
    UsageChartComponent,
    LastEventsComponent
  ],
  templateUrl: './monitor.component.html',
})
export class MonitorComponent {
  server: Server | null;
  MonitorType = MonitorType;
  constructor(router: Router){
    if(router.currentNavigation()?.extras.state) {
      const server = router.currentNavigation()?.extras.state?.['server'];   
      this.server = server;
    } else {
      this.server = null;
      router.navigate(['/dashboard']);
    }
  }
}