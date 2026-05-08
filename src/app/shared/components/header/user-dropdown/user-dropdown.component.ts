import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  userName = 'Invitado';
  userEmail = 'guest@example.com';

  constructor(private router: Router) {}

  ngOnInit(): void {

    const userData = localStorage.getItem('user');

    if (userData) {

      const user = JSON.parse(userData);

      this.userName = user.nombre;
      this.userEmail = user.correo;
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
    localStorage.removeItem('role');

    // REDIRIGIR
    this.router.navigate(['/signin']);
  }
}