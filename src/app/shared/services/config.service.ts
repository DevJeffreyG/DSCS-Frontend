import { Injectable } from '@angular/core';
import { Config } from '../interfaces/config';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  async getConfig() {
    // TODO: API CALL
    return new Promise<Config>((resolve) => {
      resolve(this.dummyConfig);
    });
  }

  async saveConfig(config: Config) {
    // TODO: API CALL
    return new Promise<void>((resolve) => {
      this.dummyConfig = config;
      resolve();
    });
  }

  private dummyConfig: Config = {
    cpuThreshold: 75,
    ramThreshold: 80,
    monitoringInterval: 5
  }
}
