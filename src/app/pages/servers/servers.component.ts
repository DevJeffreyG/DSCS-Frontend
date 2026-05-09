import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ServerService } from '../../shared/services/server.service';
import { Server } from '../../shared/interfaces/server';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './servers.component.html',
})

export class ServersComponent {

  servers: Server[] = [];

  showForm = false;

  newServer: any = {
    nombre: '',
    ip: '',
    estado: 'Online'
  };

  constructor(
    private router: Router,
    private serverService: ServerService
  ) {}

  async ngOnInit() {

    this.servers =
      await this.serverService.getAllServers();

  }

  // =========================
  // VER MONITOR
  // =========================
  monitorFullView(server: Server) {

    this.router.navigate(
      [`/monitor/${server.id}`],
      {
        state: { server: server }
      }
    );

  }

  // =========================
  // AGREGAR
  // =========================
  async addServer() {

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

    // ACTUALIZAR
    this.servers =
      await this.serverService.getAllServers();

    // LIMPIAR
    this.newServer = {
      nombre: '',
      ip: '',
      estado: 'Online'
    };

    // CERRAR FORM
    this.showForm = false;

  }

}