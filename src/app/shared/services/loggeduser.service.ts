import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { UserRole } from '../enums/user-role';

interface LoggedUser {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class LoggeduserService {
  static user: LoggedUser | null = null;

  public static setUser(user: User) {
    let logg = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    };

    // guardar usuario completo
    localStorage.setItem(
      'user',
      JSON.stringify(logg)
    );

    LoggeduserService.user = logg;
  }

  public static getUser(): LoggedUser {

    return LoggeduserService.user || JSON.parse(localStorage.getItem('user') || '{}');
  }

  public static signOut() {
    LoggeduserService.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  }
}
