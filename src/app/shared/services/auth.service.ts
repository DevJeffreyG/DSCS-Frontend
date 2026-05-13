import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { ApiHelper } from '../../core/apihelper';
import { LoggeduserService } from './loggeduser.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }

  async validateToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(ApiHelper.getEndpoint('validateToken'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .subscribe({
          next: (resp) => resolve(resp),
          error: (error) => reject(error)
        });
    });
  }

  async login(correo: string, contraseña: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.http.post<{ token: string, user: User }>(ApiHelper.getEndpoint('auth'), { correo, contraseña })
        .subscribe({
          next: (r) => {
            const user = r.user;
            LoggeduserService.setUser(user);
            localStorage.setItem('auth', r.token);
            resolve(user);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }
}
