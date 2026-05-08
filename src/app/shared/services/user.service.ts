import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { UserRole } from '../enums/user-role';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  async getUsers(): Promise<User[]> {
    return this.dummyUsers;
  }

  async addUser(user: User): Promise<void> {
    this.dummyUsers.push(user);
  }

  // LOGIN
  async login(correo: string, contraseña: string): Promise<User | null> {

    const user = this.dummyUsers.find(
      u =>
        u.correo === correo &&
        u.contraseña === contraseña
    );

    return user || null;
  }

  private dummyUsers: User[] = [
    {
      id_usuario: 1,
      nombre: 'Admin User',
      correo: 'admin@example.com',
      contraseña: 'admin123',
      rol: UserRole.Admin,
    },
    {
      id_usuario: 2,
      nombre: 'Operator User',
      correo: 'operator@example.com',
      contraseña: 'operator123',
      rol: UserRole.Operator,
    },
    {
      id_usuario: 3,
      nombre: 'Regular User',
      correo: 'user@example.com',
      contraseña: 'user123',
      rol: UserRole.User,
    }
  ];
}