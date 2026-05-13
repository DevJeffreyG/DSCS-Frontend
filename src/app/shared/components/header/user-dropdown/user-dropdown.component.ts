import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoggeduserService } from '../../../services/loggeduser.service';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports: [
    CommonModule,
    RouterModule,
    DropdownComponent
  ]
})
export class UserDropdownComponent implements OnInit {

  isOpen = false;

  // DATOS USUARIO
  shortUserName: string | null = null;
  userName: string | null = null;
  userEmail: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {

    const userData = LoggeduserService.getUser(); // Obtener datos del usuario loggeado desde el servicio

    if (userData) {
      let name = userData.nombre;

      if(name.length > 20) {
        name = name.substring(0, 17) + '...';
      }
      this.shortUserName = name;
      this.userName = userData.nombre;
      this.userEmail = userData.correo;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {

    // LIMPIAR SESION
    localStorage.removeItem('auth');
    localStorage.removeItem('user');

    // REDIRIGIR
    this.router.navigate(['/signin']);
  }
}