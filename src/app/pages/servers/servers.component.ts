import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/services/server.service';
import { Server } from '../../shared/interfaces/server';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servers.component.html',
})


export class ServersComponent {
  servers: Server[] = [];

  constructor(private router: Router, private serverService: ServerService) {}

  async ngOnInit() {
    this.servers = await this.serverService.getAllServers();
  }

  monitorFullView(server: Server) {
    this.router.navigate([`/monitor/${server.id}`], { state: { server: server } });
  }

}