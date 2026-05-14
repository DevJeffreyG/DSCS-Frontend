
import { Component, Input, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MonitorType } from '../../../enums/monitor-type';
import { ServerService } from '../../../services/server.service';

@Component({
  selector: 'app-usage-chart',
  imports: [
    NgApexchartsModule,
  ],
  templateUrl: './usage-chart.component.html',
})
export class UsageChartComponent implements OnInit {
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

  constructor(private serverService: ServerService) { }

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

    setInterval(() => {
      if (this.serverId)
        this.serverService.getServerUsage(this.serverId).then(usage => {
          let value = 0;
          switch (this.usageType) {
            case MonitorType.CPU:
              value = usage.cpu;
              break;
            case MonitorType.RAM:
              value = usage.ram;
              break;
            case MonitorType.DISK:
              value = usage.disco;
              break;
            case MonitorType.NET:
              value = usage.red;
              break;
            default:
              value = 0;
          }

          this.lastUpdated = new Date();

          // Determina el índice de umbral actual
          let currentIndex = 0;
          for (let i = this.thresholds.length - 1; i >= 0; i--) {
            if (value >= this.thresholds[i].value) {
              currentIndex = i;
              break;
            }
          }
          // Solo actualiza el color si el índice cambió, sin tocar la serie
          if (currentIndex !== this.lastThresholdIndex) {
            const threshold = this.thresholds[currentIndex];
            // Asegura que los arrays existan antes de asignar
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

          this.changePercentage(value);
        });
    }, 1000); // Update every second
  }

  changePercentage(newValue: number) {
    if (newValue > 100) newValue = 100;
    if (newValue < 0) newValue = 0;

    if (newValue == this.usageNumber[0]) return;
    this.usageNumber = [newValue];
  }

}
