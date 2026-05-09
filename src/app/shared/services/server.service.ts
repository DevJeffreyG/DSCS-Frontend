import { Injectable, OnDestroy } from '@angular/core';
import { Observable, firstValueFrom, take } from 'rxjs';
import { Server } from '../interfaces/server';
import { ServerAlert, AlertFilter, AlertStats } from '../interfaces/alert';
import { AlertManagerService } from './alert-manager.service';

@Injectable({
  providedIn: 'root',
})
export class ServerService implements OnDestroy {
  constructor(
    private alertManager: AlertManagerService
  ) {}
  async getAllServers(): Promise<Server[]> {
    // TODO: API CALL
    return new Promise((resolve) => {
      resolve(this.dummyServers);
    })
  }

  async getServerUsage(serverId: number): Promise<{ cpu: number; ram: number; disco: number, red: number }> {
    // TODO: API CALL
    return new Promise((resolve) => {
      const server = this.dummyServers.find(s => s.id === serverId);
      if (server) {
        resolve({
          cpu: server.cpu,
          ram: server.ram,
          disco: server.disco,
          red: server.red
        });
      } else {
        resolve({ cpu: 0, ram: 0, disco: 0, red: 0 });
      }
    });
  }

  // ============= MÉTODOS DE ALERTAS =============

  /**
   * Obtener alertas activas de un servidor
   */
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
  getHistoricalAlerts(
    serverId: number,
    filters?: AlertFilter
  ): Observable<ServerAlert[]> {
    return this.alertManager.getHistoricalAlerts(serverId, filters);
  }

  /**
   * Obtener alertas activas desde el backend
   */
  getActiveAlertsFromBackend(serverId: number): Observable<ServerAlert[]> {
    return this.alertManager.getActiveAlertsFromBackend(serverId);
  }

  /**
   * Obtener alertas filtradas por tipo, recurso, etc.
   */
  getFilteredAlerts(serverId: number, filters: AlertFilter): Observable<ServerAlert[]> {
    return this.alertManager.getFilteredAlerts(serverId, filters);
  }

  /**
   * Obtener estadísticas de alertas de un servidor
   */
  getAlertStats(serverId: number): Observable<AlertStats> {
    return this.alertManager.getAlertStats(serverId);
  }

  /**
   * Obtener todas las alertas críticas de todos los servidores
   */
  getAllCriticalAlerts(): Observable<ServerAlert[]> {
    return this.alertManager.getAllCriticalAlerts();
  }

  /**
   * Marcar una alerta como resuelta
   */
  resolveAlert(alertId: string): Observable<void> {
    return this.alertManager.resolveAlert(alertId);
  }

  /**
   * Suscribirse a alertas en tiempo real de un servidor
   */
  subscribeToServerAlerts(serverId: number): Observable<ServerAlert> {
    return this.alertManager.subscribeToServer(serverId);
  }

  /**
   * Desuscribirse de alertas de un servidor
   */
  unsubscribeFromServerAlerts(serverId: number): void {
    this.alertManager.unsubscribeFromServer(serverId);
  }

  /**
   * Limpiar alertas resueltas de un servidor
   */
  clearResolvedAlerts(serverId: number): void {
    this.alertManager.clearResolvedAlerts(serverId);
  }

  /**
   * Limpiar todas las alertas de un servidor
   */
  clearServerAlerts(serverId: number): void {
    this.alertManager.clearAllAlerts(serverId);
  }

  /**
   * Verificar si está conectado al WebSocket
   */
  isAlertListenerConnected$(): Observable<boolean> {
    return this.alertManager.isConnected$();
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
  ]

  ngOnDestroy() {
    // Desuscribirse de todos los servidores
    this.dummyServers.forEach(server => {
      this.unsubscribeFromServerAlerts(server.id);
    });
  }
} 
