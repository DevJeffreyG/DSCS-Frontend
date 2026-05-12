import { Injectable } from '@angular/core';
import { Config } from '../interfaces/config';
import { HttpClient } from '@angular/common/http';
import { ApiHelper } from '../../core/apihelper';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http: HttpClient) { }

  async getConfig() {
    // TODO: API CALL
    return new Promise<Config>((resolve, reject) => {
      this.http.get<Config>(ApiHelper.getEndpoint('getConfig'))
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => reject(error)
        });
    });
  }

  async saveConfig(config: Config) {
    // TODO: API CALL
    return new Promise<void>((resolve, reject) => {
      this.http.put<void>(ApiHelper.getEndpoint('saveConfig'), config)
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  private dummyConfig: Config = {
    cpuThreshold: 75,
    ramThreshold: 80,
    monitoringInterval: 5
  }
}
