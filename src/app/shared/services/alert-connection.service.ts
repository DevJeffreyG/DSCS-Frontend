import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AlertListenerService } from './alert-listener.service'
import { ServerAlert, AlertFilter } from '../interfaces/alert';

/**
 * Servicio que permite cambiar entre modo real (WebSocket) y testing (Simulador)
 */
@Injectable({
  providedIn: 'root',
})
export class AlertConnectionService {
  private mode: 'real' | 'testing' = 'real';
  private currentSource: AlertListenerService;
  private modeSubject = new Subject<'real' | 'testing'>();

  public mode$ = this.modeSubject.asObservable();

  constructor(
    private realListener: AlertListenerService
  ) {
    this.currentSource = this.realListener;
  }

  /**
   * Cambiar a modo real con WebSocket
   */
  setRealMode() {
    console.log('🔗 Cambiando a modo REAL (WebSocket)');
    this.mode = 'real';
    this.currentSource = this.realListener;
    this.modeSubject.next('real');
  }

  /**
   * Obtener modo actual
   */
  getMode(): 'real' | 'testing' {
    return this.mode;
  }

  /**
   * Obtener alertas según modo actual
   */
  getAlerts$(): Observable<ServerAlert> {
    return this.realListener.alerts$;
  }

  /**
   * Obtener alertas históricas
   */
  getHistoricalAlerts(
    serverId: number,
    filters?: AlertFilter
  ): Observable<ServerAlert[]> {
    if (this.mode === 'testing') {
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }
    return this.realListener.getHistoricalAlerts(serverId, filters);
  }

  /**
   * Resolver alerta
   */
  resolveAlert(alertId: string): Observable<void> {
    if (this.mode === 'testing') {
      return new Observable((observer) => {
        observer.next();
        observer.complete();
      });
    }
    return this.realListener.resolveAlert(alertId);
  }

  /**
   * Suscribirse a alertas de servidor
   */
  subscribeToServer(serverId: number): Observable<ServerAlert> {
    return this.realListener.subscribeToServer(serverId);
  }

  /**
   * Desuscribirse
   */
  unsubscribeFromServer(serverId: number): void {
    if (this.mode === 'real') {
      this.realListener.unsubscribeFromServer(serverId);
    }
  }

  /**
   * Estado de conexión
   */
  isConnected$(): Observable<boolean> {
    if (this.mode === 'testing') {
      return new Observable((observer) => {
        observer.next(true);
      });
    }
    return this.realListener.connected$;
  }
}
