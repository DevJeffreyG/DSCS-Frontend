import { Injectable } from '@angular/core';
import { Server } from '../interfaces/server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
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
} 
