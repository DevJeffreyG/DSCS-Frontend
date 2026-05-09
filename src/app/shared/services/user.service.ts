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

    return this.dummyUsers;

  }

  // =====================================
  // ADD USER
  // =====================================
  async addUser(user: User): Promise<void> {

    this.dummyUsers.push(user);

  }

  // =====================================
  // GET USER BY ID
  // =====================================
  async getUserById(
    id: number
  ): Promise<User | undefined> {

    return new Promise((resolve) => {

      const user =
        this.dummyUsers.find(
          u => u.id_usuario === id
        );

      resolve(user);

    });

  }

  // =====================================
  // UPDATE USER
  // =====================================
  async updateUser(
    id: number,
    updatedUser: User
  ): Promise<void> {

    const index =
      this.dummyUsers.findIndex(
        u => u.id_usuario === id
      );

    if (index !== -1) {

      this.dummyUsers[index] =
        updatedUser;

    }

  }

  // =====================================
  // DELETE USER
  // =====================================
  async deleteUser(
    id: number
  ): Promise<void> {

    this.dummyUsers =
      this.dummyUsers.filter(
        u => u.id_usuario !== id
      );

  }

  // =====================================
  // LOGIN
  // =====================================
  async login(
    correo: string,
    contraseña: string
  ): Promise<User | null> {

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

  // =====================================
  // DUMMY USERS
  // =====================================
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