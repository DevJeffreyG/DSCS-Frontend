import { Injectable } from '@angular/core';
import { User, UserPublic } from '../interfaces/user';
import { UserRole } from '../enums/user-role';
import { LoggeduserService } from './loggeduser.service';
import { HttpClient } from '@angular/common/http';
import { ApiHelper } from '../../core/apihelper';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  // =====================================
  // GET USERS
  // =====================================
  async getUsers(): Promise<UserPublic[]> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.get<UserPublic[]>(ApiHelper.getEndpoint('allUsers'), ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => reject(error)
        });
    });
  }

  async addUser(user: User  ): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.post<void>(ApiHelper.getEndpoint('addUser'), user, ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  async getUserById(id: number): Promise<UserPublic | undefined> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.get<UserPublic>(ApiHelper.getEndpoint('userById', { userid: id }), ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => reject(error)
        });
    });
  }

  async updateUser(id: number, updatedUser: User): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.put<void>(ApiHelper.getEndpoint('updateUser', { userid: id }), updatedUser, ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  async deleteUser(
    id: number
  ): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.delete<void>(ApiHelper.getEndpoint('deleteUser', { userid: id }), ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => reject(error)
        });
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
    }
  ];

}