import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ServerService } from '../../shared/services/server.service';
import { Server } from '../../shared/interfaces/server';
import { AlertListenerService, ServerMetricsSnapshot } from '../../shared/services/alert-listener.service';

import { LoggeduserService } from '../../shared/services/loggeduser.service';
import { UserRole } from '../../shared/enums/user-role';
import { formatTimestamp } from '../../core/format';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './servers.component.html',
})

export class ServersComponent implements OnInit, OnDestroy {

  servers: Server[] = [];
  lastUpdate: Date = new Date();

  showForm = false;

  currentUserRole: UserRole | null = null;

  userRoles = UserRole;

  newServer: any = {
    nombre: '',
    ip: '',
    estado: 'Online'
  };

  private destroy$ = new Subject<void>();
  private knownServerIds = new Set<number>();

  constructor(
    private router: Router,
    private serverService: ServerService,
    private alertListener: AlertListenerService
  ) {}

  ngOnInit() {
    this.alertListener.metrics$
      .pipe(takeUntil(this.destroy$))
      .subscribe((metrics: ServerMetricsSnapshot[]) => {
        this.servers = metrics.map((metric) => ({
          id: metric.serverId,
          nombre: metric.nombre,
          ip: 'auto-discovered',
          estado: 'Online',
          cpu: metric.cpu,
          ram: metric.ram,
          disco: metric.disco,
          red: metric.red,
        }));

        if (metrics.length > 0) {
          const latestTimestamp = metrics.reduce((latest, metric) => {
            const metricTimestamp = new Date(metric.timestamp).getTime();
            return metricTimestamp > latest ? metricTimestamp : latest;
          }, 0);

          this.lastUpdate = new Date(latestTimestamp);
        }

        this.knownServerIds = new Set(metrics.map((metric) => metric.serverId));
      });

    // OBTENER USUARIO LOGUEADO
    const user = LoggeduserService.getUser();

    if (user) {
      this.currentUserRole =user.rol;
    }

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  isOperator(): boolean {

    return this.currentUserRole === UserRole.Operator;

  }

  
  monitorFullView(server: Server) {

    this.router.navigate(
      [`/monitor/${server.id}`],
      {
        state: { server: server }
      }
    );

  }

  
  async addServer() {
    // BLOQUEAR OPERADOR
    if (this.isOperator()) {
      return;
    }

    if (!this.newServer.nombre) return;

    if (!this.newServer.ip) return;

    const server: Server = {
      id: Date.now(),
      nombre: this.newServer.nombre,
      ip: this.newServer.ip,
      estado: this.newServer.estado,
      cpu: Math.floor(Math.random() * 100),
      ram: Math.floor(Math.random() * 100),
      disco: Math.floor(Math.random() * 100),
      red: Math.floor(Math.random() * 100)
    };

    // GUARDAR
    await this.serverService.addServer(server);

    // ACTUALIZAR EN MEMORIA HASTA QUE LLEGUE EL PRIMER EVENTO DEL WS
    if (!this.knownServerIds.has(server.id)) {
      this.servers = [server, ...this.servers];
      this.knownServerIds.add(server.id);
    }

    this.lastUpdate = new Date();

    // LIMPIAR
    this.newServer = {
      nombre: '',
      ip: '',
      estado: 'Online'
    };

    // CERRAR FORM
    this.showForm = false;

  }

  formatTimestamp(date: Date | string): string {
    return formatTimestamp(date);
  }

}