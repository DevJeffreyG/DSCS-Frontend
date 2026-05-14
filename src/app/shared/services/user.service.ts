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

  /* async addUser(user: User  ): Promise<void> {
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
 */
  async getUserById(id: number): Promise<UserPublic | undefined> {
    return new Promise((resolve, reject) => {
      this.http.get<UserPublic>(ApiHelper.getEndpoint('userById', { id: id }), ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: (resp) => {
            resolve(resp);
          },
          error: (error) => reject(error)
        });
    });
  }

  async updateUser(id: number, updatedUser: User): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.put<void>(ApiHelper.getEndpoint('updateUser', { id: id }), updatedUser, ApiHelper.AuthorizedHeaders())
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
    return new Promise((resolve, reject) => {
      this.http.delete<void>(ApiHelper.getEndpoint('deleteUser', { id: id }), ApiHelper.AuthorizedHeaders())
        .subscribe({
          next: () => {
            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }
}