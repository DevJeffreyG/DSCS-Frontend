import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { ServerAlert, AlertFilter, AlertStats } from '../interfaces/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertListenerService implements OnDestroy {
  private socket: Socket | null = null;
  private alertSubject = new Subject<ServerAlert>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  public alerts$ = this.alertSubject.asObservable().pipe(shareReplay(1));
  public connected$ = this.connectionStatusSubject.asObservable();

  private serverListeners = new Map<number, Subject<ServerAlert>>();
  private backendUrl = 'http://localhost:3000'; // TODO: cambiar segun backend

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.socket = io(this.backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ WebSocket desconectado');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('alert', (alert: ServerAlert) => {
      // Asegurar que timestamp es Date
      alert.timestamp = new Date(alert.timestamp);
      this.alertSubject.next(alert);

      // Notificar listener específico del servidor
      if (this.serverListeners.has(alert.serverId)) {
        this.serverListeners.get(alert.serverId)?.next(alert);
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Error WebSocket:', error);
    });
  }

  /**
   * Obtener logs históricos de alertas desde el backend
   */
  getHistoricalAlerts(
    serverId: number,
    filters?: AlertFilter
  ): Observable<ServerAlert[]> {
    let params = new HttpParams()
      .set('limit', filters?.limit?.toString() || '100');

    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
    }

    if (filters?.recurso) {
      params = params.set('recurso', filters.recurso);
    }

    if (filters?.desde) {
      params = params.set('desde', filters.desde.toISOString());
    }

    if (filters?.hasta) {
      params = params.set('hasta', filters.hasta.toISOString());
    }

    if (filters?.resueltas !== undefined) {
      params = params.set('resueltas', filters.resueltas.toString());
    }

    const url = `${this.backendUrl}/api/servers/${serverId}/alerts`;
    console.log(`📥 Obteniendo alertas históricas de ${url}`, { filters });

    return this.http.get<ServerAlert[]>(url, {
        params,
      })
      .pipe(
        tap((alerts) => {
          console.log(`✅ Recibidas ${alerts.length} alertas históricas del servidor ${serverId}`, alerts);
        }),
        map((alerts) =>
          alerts.map((alert) => ({
            ...alert,
            timestamp: new Date(alert.timestamp),
            resueltoEn: alert.resueltoEn ? new Date(alert.resueltoEn) : undefined,
          }))
        )
      );
  }

  /**
   * Obtener alertas activas (sin resolver) de un servidor
   */
  getActiveAlerts(serverId: number): Observable<ServerAlert[]> {
    console.log(`🔴 Obteniendo alertas activas para servidor ${serverId}`);
    return this.getHistoricalAlerts(serverId, { resueltas: false });
  }

  /**
   * Suscribirse a alertas en tiempo real de un servidor específico
   */
  subscribeToServer(serverId: number): Observable<ServerAlert> {
    if (!this.serverListeners.has(serverId)) {
      this.serverListeners.set(serverId, new Subject());
      this.socket?.emit('subscribe-server', serverId);
    }

    return this.serverListeners.get(serverId)!.asObservable();
  }

  /**
   * Desuscribirse de un servidor
   */
  unsubscribeFromServer(serverId: number): void {
    this.serverListeners.delete(serverId);
    this.socket?.emit('unsubscribe-server', serverId);
  }

  /**
   * Marcar una alerta como resuelta
   */
  resolveAlert(alertId: string): Observable<void> {
    return this.http.patch<void>(`${this.backendUrl}/api/alerts/${alertId}`, {
      resuelto: true,
      resueltoEn: new Date(),
    });
  }

  /**
   * Obtener estadísticas de alertas
   */
  getAlertStats(serverId: number): Observable<AlertStats> {
    return this.http.get<AlertStats>(`${this.backendUrl}/api/servers/${serverId}/alerts/stats`);
  }

  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  ngOnDestroy() {
    this.socket?.disconnect();
  }
}
