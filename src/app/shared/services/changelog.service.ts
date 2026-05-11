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
    // TODO: API CALL
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

  async newChangelog(changelog: Changelog): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve, reject) => {
      this.http.post<void>(ApiHelper.getEndpoint('newChangelog'), changelog)
        .subscribe({
          next: () => {
            this.syncChangelogs().catch(error => {
              console.error('❌ Error sincronizando changelogs después de agregar uno nuevo:', error);
            });

            resolve();
          },
          error: (error) => reject(error)
        });
    });
  }

  private async syncChangelogs() {
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
      (left, right) => right.fecha.getTime() - left.fecha.getTime()
    );
  }

  private dummyChangelogs: Changelog[] = [
    {
      id: 1,
      descripcion: 'Se actualizó el umbral de CPU a 30%',
      tipo: ChangelogType.CPU,
      old: { cpuThreshold: 20 },
      new: { cpuThreshold: 30 },
      fecha: new Date('2024-06-01T10:00:00'),
      id_usuario: 1
    },
    {
      id: 2,
      descripcion: 'Se agregó un nuevo usuario con rol de operador',
      tipo: ChangelogType.NEW_USER,
      old: undefined,
      new: { nombre: 'John Doe', rol: UserRole.Operator },
      fecha: new Date('2024-06-02T14:30:00'),
      id_usuario: 1
    },
    {
      id: 3,
      descripcion: 'Se cambió el rol del usuario "Juan Pérez" a Admin',
      tipo: ChangelogType.USER_ROLE_CHANGED,
      old: { rol: UserRole.Operator },
      new: { rol: UserRole.Admin },
      fecha: new Date('2024-06-03T09:15:00'),
      id_usuario: 2
    },
    {
      id: 4,
      descripcion: 'Se eliminó el usuario "María García"',
      tipo: ChangelogType.USER_REMOVED,
      old: { nombre: 'María García', rol: UserRole.Operator },
      new: undefined,
      fecha: new Date('2024-06-04T11:45:00'),
      id_usuario: 2
    },
    {
      id: 5,
      descripcion: 'Se actualizó el umbral de RAM a 90%',
      tipo: ChangelogType.RAM,
      old: { ramThreshold: 80 },
      new: { ramThreshold: 90 },
      fecha: new Date('2024-06-05T16:20:00'),
      id_usuario: 1
    }
  ]
}
