import { Component } from '@angular/core';
import { LatestChangesComponent } from '../../shared/components/latest-changes/latest-changes.component';
import { ConfigService } from '../../shared/services/config.service';
import { Config } from '../../shared/interfaces/config';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { CommonModule } from '@angular/common';
import { UserCrudComponent } from '../../shared/components/user-crud/user-crud.component';
import { ChangelogService } from '../../shared/services/changelog.service';
import { ChangelogType } from '../../shared/enums/changelog-type';
import { LoggeduserService } from '../../shared/services/loggeduser.service';

@Component({
  selector: 'app-config',
  imports: [
    LatestChangesComponent,
    AlertComponent,
    CommonModule,
    UserCrudComponent
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent {
  cpuThreshold = 0;
  ramThreshold = 0;

  saveSuccess = false;
  saveError = false;

  successMessage = 'La configuración se ha guardado exitosamente.';
  errorMessage = 'Ocurrió un error al guardar la configuración.';

  private config!: Config;

  // track color (unfilled)
  get trackColor(): string {
    return document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
  }

  constructor(private configService: ConfigService, private changelogService: ChangelogService) { }

  async ngOnInit() {
    this.config = await this.configService.getConfig();
    this.cpuThreshold = this.config.cpuThreshold;
    this.ramThreshold = this.config.ramThreshold;
    this.monitoringInterval = this.config.monitoringInterval;

  }

  // Map value -> color: green, blue, yellow, red
  colorForValue(value: number): string {
    let g = 50;
    let b = 70;
    let y = 90;

    const v = Math.max(0, Math.min(100, Number(value) || 0));
    if (v <= g) return '#10b981'; // green-500
    if (v <= b) return '#3b82f6'; // blue-500
    if (v <= y) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  }

  rangeBackground(value: number): string {
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    const gap = 0.3; // percent of track left empty before the thumb
    const fillEnd = Math.max(0, v - gap);
    const color = this.colorForValue(v);
    return `linear-gradient(to right, ${color} 0%, ${color} ${fillEnd}%, ${this.trackColor} ${fillEnd}%, ${this.trackColor} 100%)`;
  }

  onCpuInput(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpuThreshold = el.valueAsNumber;
  }

  onRamInput(e: Event) {
    const el = e.target as HTMLInputElement;
    this.ramThreshold = el.valueAsNumber;
  }

  monitoringInterval = 30;

  onMonitoringIntervalInput(e: Event) {
    const el = e.target as HTMLInputElement;
    this.monitoringInterval = el.valueAsNumber;
  }

  saveConfiguration() {
    if (this.cpuThreshold === this.config.cpuThreshold && this.ramThreshold === this.config.ramThreshold && this.monitoringInterval === this.config.monitoringInterval) {
      // No changes to save
      this.saveError = true;
      this.errorMessage = 'No se han realizado cambios en la configuración.';

      setInterval(() => {
        this.saveError = false;
      }, 15000);
      return;
    }

    this.configService.saveConfig({
      cpuThreshold: this.cpuThreshold,
      ramThreshold: this.ramThreshold,
      monitoringInterval: this.monitoringInterval
    }).then(() => {
      let user = LoggeduserService.getUser();
      console.log(user);
      
      this.saveSuccess = true;
      this.successMessage = 'La configuración se ha guardado exitosamente.';

      this.config = {
        cpuThreshold: this.cpuThreshold,
        ramThreshold: this.ramThreshold,
        monitoringInterval: this.monitoringInterval
      }

      setInterval(() => {
        this.saveSuccess = false;
      }, 15000);
    }).catch((err) => {
      // mostrar mensaje de error
      console.error('Error saving configuration', err);
      this.errorMessage = 'Ocurrió un error al guardar la configuración.';
      this.saveError = true;

      setInterval(() => {
        this.saveError = false;
      }, 15000);
    });

    console.log('Saving configuration', {
      cpuThreshold: this.cpuThreshold,
      ramThreshold: this.ramThreshold,
      monitoringInterval: this.monitoringInterval,
    });
  }

  cancelChanges() {
    // Reset to sensible defaults (or previously loaded values)
    this.cpuThreshold = this.config.cpuThreshold;
    this.ramThreshold = this.config.ramThreshold;
    this.monitoringInterval = this.config.monitoringInterval;

    this.saveSuccess = false;
    this.saveError = false;
  }
}
