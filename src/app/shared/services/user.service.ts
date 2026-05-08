import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { UserRole } from '../enums/user-role';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  async getUsers(): Promise<User[]> {
    // TODO: API CALL
    return new Promise((resolve) => {
      resolve(this.dummyUsers);
    });
  }

  async addUser(user: User): Promise<void> {

    console.log('Adding user in service:', user);
    
    // TODO: API CALL
    return new Promise((resolve) => {
      this.dummyUsers.push(user);
      resolve();
    });
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
