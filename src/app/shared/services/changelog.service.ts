import { Injectable } from '@angular/core';
import { Changelog } from '../interfaces/changelog';
import { ChangelogType } from '../enums/changelog-type';
import { UserRole } from '../enums/user-role';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiHelper } from '../../core/apihelper';

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {
  private changelogSubject = new BehaviorSubject<Changelog[]>([]);
  changelogs$ = this.changelogSubject.asObservable();

  constructor(private http: HttpClient) {
    this.syncChangelogs().catch(error => {
      console.error('❌ Error sincronizando changelogs al iniciar el servicio:', error);
    });
  }

  async getChangelogs(): Promise<Changelog[]> {
    return new Promise((resolve, reject) => {
      this.http.get<Changelog[]>(ApiHelper.getEndpoint('allChangelogs'))
        .subscribe({
          next: (resp) => {
            try {
              resolve(resp);
            } catch (error) {
              console.error('❌ Error obteniendo changelogs:', error);
              resolve([]);
            }
          },
          error: (error) => reject(error)
        });
    });
  }

  async syncChangelogs() {
    try {
      const sorted = await this.getSortedChangelogs();
      this.changelogSubject.next(sorted);
    } catch (error) {
      console.error('❌ Error sincronizando changelogs:', error);
      this.changelogSubject.next([]);
    }
  }

  private async getSortedChangelogs(): Promise<Changelog[]> {
    const changelogs = await this.getChangelogs();
    return changelogs.sort(
      (left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime()
    );
  }
}
