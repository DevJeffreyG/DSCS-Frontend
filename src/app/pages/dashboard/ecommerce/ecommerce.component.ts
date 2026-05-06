import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent {

  servers = [
    {
      id: 1,
      nombre: 'Servidor Principal',
      ip: '192.168.1.10',
      estado: 'Online',
      cpu: 35,
      ram: 62,
      disco: 48
    },
    {
      id: 2,
      nombre: 'Base de Datos',
      ip: '192.168.1.20',
      estado: 'Online',
      cpu: 75,
      ram: 80,
      disco: 65
    },
    {
      id: 3,
      nombre: 'Servidor Web',
      ip: '192.168.1.30',
      estado: 'Offline',
      cpu: 0,
      ram: 0,
      disco: 20
    }
  ];

}