
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { MonitorType } from '../../../enums/monitor-type';
import { AlertListenerService, ServerMetricsSnapshot } from '../../../services/alert-listener.service';

@Component({
  selector: 'app-usage-chart',
  imports: [
    NgApexchartsModule,
  ],
  templateUrl: './usage-chart.component.html',
})
export class UsageChartComponent implements OnInit, OnDestroy {
  @Input('usage-type') usageType: MonitorType = MonitorType.CPU;
  @Input('server-id') serverId: number | undefined;
  name: string = 'CPU';
  message: string = 'Aquí puede ir un texto!';
  lastUpdated: Date = new Date();

  lastThresholdIndex = 0;

  thresholds = [
    { value: 0, color: '#465FFF' },
    { value: 50, color: '#FFA500' },
    { value: 75, color: '#FFA500' },
    { value: 90, color: '#FF0000' }
  ]

  public usageNumber: ApexNonAxisChartSeries = [0];
  public MonitorType = MonitorType;

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'radialBar',
    height: 330,
    sparkline: { enabled: true },
    animations: { enabled: true },
  };
  public plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -85,
      endAngle: 85,
      hollow: { size: '80%' },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: { show: false },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: -10,
          color: '#1D2939',
          formatter: (val: number) => `${val}%`,
        },
      }
    },
  };
  public fill: ApexFill = {
    type: 'solid',
    colors: ['#465FFF'],
  };
  public stroke: ApexStroke = {
    lineCap: 'round',
  };
  public labels: string[] = ['Progress'];
  public colors: string[] = ['#465FFF'];
  private destroy$ = new Subject<void>();

  constructor(private alertListener: AlertListenerService) { }

  async ngOnInit() {
    switch (this.usageType) {
      case MonitorType.CPU:
        this.name = 'CPU';
        this.message = 'Uso del procesador en tiempo real.';
        break;
      case MonitorType.RAM:
        this.name = 'RAM';
        this.message = 'Uso de la memoria en tiempo real.';
        break;
      case MonitorType.DISK:
        this.name = 'DISCO';
        this.message = 'Uso del disco en tiempo real.';
        break;
      case MonitorType.NET:
        this.name = 'RED';
        this.message = 'Uso de la red en tiempo real.';
        break;
      default:
        this.name = 'Monitor';
        this.message = 'Monitor de recurso.';
    }

    this.alertListener.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe((metrics: ServerMetricsSnapshot[]) => {
        if (!this.serverId) {
          return;
        }

        const currentServer = metrics.find((metric) => metric.serverId === this.serverId);

        if (!currentServer) {
          return;
        }

        const value = this.getMetricValue(currentServer);
        this.lastUpdated = currentServer.timestamp;
        this.updateThresholdColor(value);
        this.changePercentage(value);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getMetricValue(server: ServerMetricsSnapshot): number {
    switch (this.usageType) {
      case MonitorType.CPU:
        return server.cpu;
      case MonitorType.RAM:
        return server.ram;
      case MonitorType.DISK:
        return server.disco;
      case MonitorType.NET:
        return server.red;
      default:
        return 0;
    }
  }

  private updateThresholdColor(value: number) {
    let currentIndex = 0;

    for (let i = this.thresholds.length - 1; i >= 0; i--) {
      if (value >= this.thresholds[i].value) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === this.lastThresholdIndex) {
      return;
    }

    const threshold = this.thresholds[currentIndex];

    if (Array.isArray(this.fill.colors) && this.fill.colors.length > 0) {
      this.fill.colors[0] = threshold.color;
    } else {
      this.fill.colors = [threshold.color];
    }

    if (Array.isArray(this.colors) && this.colors.length > 0) {
      this.colors[0] = threshold.color;
    } else {
      this.colors = [threshold.color];
    }

    this.lastThresholdIndex = currentIndex;
  }

  changePercentage(newValue: number) {
    if (newValue > 100) newValue = 100;
    if (newValue < 0) newValue = 0;

    if (newValue == this.usageNumber[0]) return;
    this.usageNumber = [newValue];
  }

}
