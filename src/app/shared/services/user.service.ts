import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { UserRole } from '../enums/user-role';
import { LoggeduserService } from './loggeduser.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  // =====================================
  // GET USERS
  // =====================================
  async getUsers(): Promise<User[]> {
    // TODO: API CALL
    return new Promise((resolve) => {
      resolve(this.dummyUsers);
    });
  }

  async addUser(user: User): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
      this.dummyUsers.push(user);
      resolve();
    });
  }

  async getUserById(
    id: number
  ): Promise<User | undefined> {
    // TODO: API CALL
    return new Promise((resolve) => {
      const user =
        this.dummyUsers.find(
          u => u.id_usuario === id
        );

      resolve(user);
    });

  }

  async updateUser(
    id: number,
    updatedUser: User
  ): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {

      const index =
        this.dummyUsers.findIndex(
          u => u.id_usuario === id
        );

      if (index !== -1) {

        this.dummyUsers[index] =
          updatedUser;

      }
      resolve();
    });

  }

  async deleteUser(
    id: number
  ): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
    this.dummyUsers =
      this.dummyUsers.filter(
        u => u.id_usuario !== id
      );
      resolve();
    });
  }

  async login(
    correo: string,
    contraseña: string
  ): Promise<User | null> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {

      const user =
        this.dummyUsers.find(
          u =>
            u.correo === correo &&
            u.contraseña === contraseña
        );

      if (!user) {

        reject(
          new Error(
            'Correo o contraseña incorrectos'
          )
        );

        return;

      }

      LoggeduserService.setUser(user);

      localStorage.setItem(
        'auth',
        'true'
      );

      resolve(user);

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