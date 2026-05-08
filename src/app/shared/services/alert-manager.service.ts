import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ServerAlert, AlertStats, AlertFilter } from '../interfaces/alert';
import { AlertListenerService } from './alert-listener.service';

@Injectable({
  providedIn: 'root',
})
export class AlertManagerService implements OnDestroy {
  // Estado global de alertas activas por servidor (solo en memoria)
  private activeAlerts = new BehaviorSubject<Map<number, ServerAlert[]>>(
    new Map()
  );

  // Observable público de alertas activas
  public activeAlerts$ = this.activeAlerts.asObservable();

  // Observable de alertas críticas
  public criticalAlerts$ = this.activeAlerts$.pipe(
    map((cache) => {
      const critical: ServerAlert[] = [];
      cache.forEach((alerts) => {
        critical.push(...alerts.filter((a) => a.tipo === 'CRITICAL'));
      });
      return critical;
    })
  );

  private destroy$ = new Subject<void>();
  private loadedServers = new Set<number>(); // Servidores que ya cargaron alertas históricas

  constructor(
    private alertListener: AlertListenerService
) {
    this.setupAlertHandling();
  }

  /**
   * Configurar el manejo de alertas en tiempo real
   */
  private setupAlertHandling() {
    // Escuchar desde AlertListener (WebSocket)
    this.alertListener.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((alert) => {
        this.handleNewAlert(alert);
      });
  }

  /**
   * Manejar una nueva alerta
   */
  private handleNewAlert(alert: ServerAlert) {
    // Actualizar estado en memoria
    const current = this.activeAlerts.value;
    const serverAlerts = current.get(alert.serverId) || [];

    // Evitar duplicados
    if (!serverAlerts.find((a) => a.id === alert.id)) {
      serverAlerts.unshift(alert);
      current.set(alert.serverId, serverAlerts);
      this.activeAlerts.next(new Map(current));
    }
  }

  /**
   * Obtener alertas activas de un servidor específico
   * Carga alertas históricas la primera vez que se accede a un servidor
   */
  getServerAlerts(serverId: number): Observable<ServerAlert[]> {
    // Si no hemos cargado las alertas históricas de este servidor, cargarlas
    if (!this.loadedServers.has(serverId)) {
      this.loadedServers.add(serverId);
      console.log(`📥 Cargando alertas históricas del servidor ${serverId}...`);
      
      // Cargar alertas históricas del backend
      this.alertListener.getActiveAlerts(serverId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (historicalAlerts) => {
            console.log(`✅ Cargadas ${historicalAlerts.length} alertas históricas del servidor ${serverId}`);
            // Inicializar con las alertas históricas
            const current = this.activeAlerts.value;
            const existing = current.get(serverId) || [];
            
            // Combinar: primero las históricas, luego las que llegaron por WebSocket
            const combined = [
              ...historicalAlerts,
              ...existing.filter(e => !historicalAlerts.find(h => h.id === e.id))
            ];
            
            current.set(serverId, combined);
            this.activeAlerts.next(new Map(current));
          },
          (error) => {
            console.error(`❌ Error cargando alertas históricas del servidor ${serverId}:`, error);
          }
        );
    }

    return this.activeAlerts$.pipe(
      map((cache) => cache.get(serverId) || [])
    );
  }

  /**
   * Obtener alertas filtradas
   */
  getFilteredAlerts(
    serverId: number,
    filters: AlertFilter
  ): Observable<ServerAlert[]> {
    return this.getServerAlerts(serverId).pipe(
      map((alerts) => {
        let filtered = [...alerts];

        if (filters.tipo) {
          filtered = filtered.filter((a) => a.tipo === filters.tipo);
        }

        if (filters.recurso) {
          filtered = filtered.filter((a) => a.recurso === filters.recurso);
        }

        if (filters.resueltas !== undefined) {
          filtered = filtered.filter((a) => a.resuelto === filters.resueltas);
        }

        return filtered.slice(0, filters.limit || 100);
      })
    );
  }

  /**
   * Obtener estadísticas de alertas para un servidor
   */
  getAlertStats(serverId: number): Observable<AlertStats> {
    return this.getServerAlerts(serverId).pipe(
      map((alerts) => ({
        total: alerts.length,
        criticas: alerts.filter((a) => a.tipo === 'CRITICAL').length,
        advertencias: alerts.filter((a) => a.tipo === 'WARNING').length,
        informativas: alerts.filter((a) => a.tipo === 'INFO').length,
        resueltas: alerts.filter((a) => a.resuelto).length,
      }))
    );
  }

  /**
   * Marcar alerta como resuelta
   */
  resolveAlert(alertId: string): Observable<void> {
    return new Observable((observer) => {
      this.alertListener.resolveAlert(alertId).subscribe(
        () => {
          // Actualizar en memoria
          const current = this.activeAlerts.value;

          current.forEach((alerts) => {
            const alert = alerts.find((a) => a.id === alertId);
            if (alert) {
              alert.resuelto = true;
              alert.resueltoEn = new Date();
            }
          });

          this.activeAlerts.next(new Map(current));

          observer.next();
          observer.complete();
        },
        (err) => observer.error(err)
      );
    });
  }

  /**
   * Suscribirse a alertas de un servidor
   */
  subscribeToServer(serverId: number): Observable<ServerAlert> {
    return this.alertListener.subscribeToServer(serverId).pipe(
      takeUntil(this.destroy$)
    );
  }

  /**
   * Obtener alertas históricas con filtros
   */
  getHistoricalAlerts(
    serverId: number,
    filters?: AlertFilter
  ): Observable<ServerAlert[]> {
    return this.alertListener.getHistoricalAlerts(serverId, filters);
  }

  /**
   * Obtener alertas activas desde el backend
   */
  getActiveAlertsFromBackend(serverId: number): Observable<ServerAlert[]> {
    return this.alertListener.getActiveAlerts(serverId);
  }

  /**
   * Desuscribirse de un servidor
   */
  unsubscribeFromServer(serverId: number): void {
    this.alertListener.unsubscribeFromServer(serverId);
  }

  /**
   * Limpiar alertas resueltas de un servidor
   */
  clearResolvedAlerts(serverId: number): void {
    const current = this.activeAlerts.value;
    const alerts = current.get(serverId) || [];
    const filtered = alerts.filter((a) => !a.resuelto);
    current.set(serverId, filtered);
    this.activeAlerts.next(new Map(current));
  }

  /**
   * Limpiar todas las alertas de un servidor
   */
  clearAllAlerts(serverId: number): void {
    const current = this.activeAlerts.value;
    current.delete(serverId);
    this.activeAlerts.next(new Map(current));
  }

  /**
   * Obtener todas las alertas críticas de todos los servidores
   */
  getAllCriticalAlerts(): Observable<ServerAlert[]> {
    return this.activeAlerts$.pipe(
      map((cache) => {
        const critical: ServerAlert[] = [];
        cache.forEach((alerts) => {
          critical.push(...alerts.filter((a) => a.tipo === 'CRITICAL'));
        });
        return critical;
      })
    );
  }

  /**
   * Verificar estado de conexión
   */
  isConnected$(): Observable<boolean> {
    return this.alertListener.connected$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
