import { Injectable } from '@angular/core';
import { Changelog } from '../interfaces/changelog';
import { ChangelogType } from '../enums/changelog-type';
import { UserRole } from '../enums/user-role';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {
  private changelogSubject = new BehaviorSubject<Changelog[]>([]);
  changelogs$ = this.changelogSubject.asObservable();

  async getChangelogs(): Promise<Changelog[]> {
    // TODO: API CALL
    return new Promise((resolve) => {
      resolve(this.getSortedChangelogs());
    });
  }

  async newChangelog(changelog: Changelog): Promise<void> {
    // TODO: API CALL
    return new Promise((resolve) => {
      this.dummyChangelogs.push(changelog);
      this.changelogSubject.next(this.getSortedChangelogs());
      resolve();
    });
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

  constructor() {
    this.changelogSubject.next(this.getSortedChangelogs());
  }

  private getSortedChangelogs(): Changelog[] {
    return [...this.dummyChangelogs].sort(
      (left, right) => right.fecha.getTime() - left.fecha.getTime()
    );
  }
}
