import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, take, BehaviorSubject } from 'rxjs';
import { Server } from '../interfaces/server';
import { ServerAlert, AlertFilter, AlertStats } from '../interfaces/alert';

import { AlertManagerService } from './alert-manager.service';
import { HttpClient } from '@angular/common/http';
import { ApiHelper } from '../../core/apihelper';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private lastUpdated$ = new BehaviorSubject<Date>(new Date());

  constructor(private alertManager: AlertManagerService, private http: HttpClient) { }

  getLastUpdated(): Observable<Date> {
    return this.lastUpdated$.asObservable();
  }

  private updateTimestamp(): void {
    this.lastUpdated$.next(new Date());
  }

  async getAllServers(): Promise<Server[]> {
    return new Promise((resolve, reject) => {
      this.http.get<Server[]>(ApiHelper.getEndpoint('allServers'))
        .subscribe({
          next: (resp) => {
            try {
              resolve(resp);
            } catch (error) {
              console.error('❌ Error obteniendo servidores:', error);
              resolve([]);
            }
          },
          error: (error) => reject(error)
        });
    });
  }

  async addServer(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<void>(ApiHelper.getEndpoint('addServer'), server)
        .subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
    });
  }
  
  async getServerUsage(serverId: number): Promise<{ cpu: number; ram: number; disco: number; red: number; }> {
    return new Promise((resolve) => {
      this.http.get<{ cpu: number; ram: number; disco: number; red: number; }>(ApiHelper.getEndpoint('getServerUsage', { serverid: serverId }))
        .subscribe({
          next: (resp) => {
            this.updateTimestamp();
            resolve(resp);
          },
          error: (error) => {
            console.error(`❌ Error obteniendo uso del servidor ${serverId}:`, error);
            resolve({
              cpu: 0,
              ram: 0,
              disco: 0,
              red: 0
            });
          }
        })
    })
  }

  getServerAlerts(serverId: number): Observable<ServerAlert[]> {
    return this.alertManager.getServerAlerts(serverId);
  }

  /**
   * Cargar las alertas de varios servidores en una sola operación
   */
  async preloadServerAlerts(servers: Server[]): Promise<void> {
    await Promise.all(
      servers.map(async (server) => {
        try {
          await firstValueFrom(this.getServerAlerts(server.id).pipe(take(1)));
        } catch (error) {
          console.error(`❌ Error cargando alertas del servidor ${server.id}:`, error);
        }
      })
    );
  }

  /**
   * Obtener alertas históricas desde el backend con filtros
   */
  getHistoricalAlerts(serverId: number, filters?: AlertFilter): Observable<ServerAlert[]> {
    return this.alertManager.getHistoricalAlerts(
      serverId,
      filters
    );
  }

  getActiveAlertsFromBackend(serverId: number): Observable<ServerAlert[]> {
    return this.alertManager.getActiveAlertsFromBackend(
      serverId
    );
  }

  getFilteredAlerts(serverId: number, filters: AlertFilter): Observable<ServerAlert[]> {
    return this.alertManager.getFilteredAlerts(
      serverId,
      filters
    );
  }

  getAlertStats(serverId: number): Observable<AlertStats> {
    return this.alertManager.getAlertStats(serverId);
  }

  getAllCriticalAlerts(): Observable<ServerAlert[]> {
    return this.alertManager.getAllCriticalAlerts();
  }

  resolveAlert(alertId: string): Observable<void> {
    return this.alertManager.resolveAlert(alertId);
  }

  subscribeToServerAlerts(serverId: number): Observable<ServerAlert> {
    return this.alertManager.subscribeToServer(serverId);
  }

  unsubscribeFromServerAlerts(serverId: number): void {
    this.alertManager.unsubscribeFromServer(serverId);
  }

  clearResolvedAlerts(serverId: number): void {
    this.alertManager.clearResolvedAlerts(serverId);
  }

  clearServerAlerts(serverId: number): void {
    this.alertManager.clearAllAlerts(serverId);
  }
}