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

  async validateToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<{ valid: boolean }>(ApiHelper.getEndpoint('validateToken'), { token })
        .subscribe({
          next: (resp) => resolve(resp.valid),
          error: (error) => resolve(true) // TODO: reject(error)
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
