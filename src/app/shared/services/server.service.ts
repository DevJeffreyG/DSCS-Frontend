import { Injectable, OnDestroy } from '@angular/core';
import { Observable, firstValueFrom, take } from 'rxjs';
import { Server } from '../interfaces/server';
import { ServerAlert, AlertFilter, AlertStats } from '../interfaces/alert';

import { AlertManagerService } from './alert-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService implements OnDestroy {

  constructor(private alertManager: AlertManagerService) { }

  async getAllServers(): Promise<Server[]> {
    // TODO: API CALL
    return new Promise((resolve) => {
      resolve(this.dummyServers);
    });
  }

  async getServerById(id: number): Promise<Server | undefined> {
    // TODO: API CALL
    return new Promise((resolve) => {
      const server = this.dummyServers.find(
        s => s.id === id
      );
      resolve(server);
    });
  }

  async addServer(server: Server): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
      this.dummyServers.push(server);
      resolve();
    });
  }



  async deleteServer(id: number): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
      this.dummyServers = this.dummyServers.filter(
        s => s.id !== id
      );

      resolve();
    });
  }



  async updateServer(updatedServer: Server): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
      const index = this.dummyServers.findIndex(
        s => s.id === updatedServer.id
      );

      if (index !== -1) {
        this.dummyServers[index] = updatedServer;
      }

      resolve();
    });

  }



  async getServerUsage(serverId: number): Promise<{ cpu: number; ram: number; disco: number; red: number; }> {
    return new Promise((resolve) => {
      this.getServerById(serverId).then(server => {
        if (server) {
          resolve({
            cpu: server.cpu,
            ram: server.ram,
            disco: server.disco,
            red: server.red
          });
        } else {
          resolve({
            cpu: 0,
            ram: 0,
            disco: 0,
            red: 0
          });
        }
      });
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

  private dummyServers: Server[] = [

    {
      id: 1,
      nombre: 'Servidor Principal',
      ip: '192.168.1.10',
      estado: 'Online',
      cpu: 35,
      ram: 62,
      disco: 48,
      red: 88
    },

    {
      id: 2,
      nombre: 'Base de Datos',
      ip: '192.168.1.20',
      estado: 'Online',
      cpu: 75,
      ram: 80,
      disco: 65,
      red: 50
    },

    {
      id: 3,
      nombre: 'Servidor Web',
      ip: '192.168.1.30',
      estado: 'Offline',
      cpu: 0,
      ram: 0,
      disco: 20,
      red: 0
    }

  ];


  ngOnDestroy() {

    this.dummyServers.forEach(server => {

      this.unsubscribeFromServerAlerts(server.id);

    });

  }

}