import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ServerService } from '../../shared/services/server.service';
import { Server } from '../../shared/interfaces/server';

import { LoggeduserService } from '../../shared/services/loggeduser.service';
import { UserRole } from '../../shared/enums/user-role';

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

  currentUserRole: UserRole | null = null;

  userRoles = UserRole;

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

    // CARGAR SERVIDORES
    this.servers = await this.serverService.getAllServers();

    // OBTENER USUARIO LOGUEADO
    const user = LoggeduserService.getUser();

    if (user) {
      this.currentUserRole =user.rol;
    }

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

    // ACTUALIZAR
    this.servers = await this.serverService.getAllServers();

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