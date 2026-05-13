import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Changelog } from '../../interfaces/changelog';
import { ChangelogService } from '../../services/changelog.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UserPublic } from '../../interfaces/user';

@Component({
  selector: 'app-latest-changes',
  imports: [
    CommonModule
  ],
  templateUrl: './latest-changes.component.html',
  styleUrl: './latest-changes.component.css',
})
export class LatestChangesComponent implements OnInit, OnDestroy {
  changelogs: Changelog[] = [];
  users: UserPublic[] = [];
  private subscription = new Subscription();

  constructor(private changelogService: ChangelogService, private userService: UserService) {}

  async ngOnInit() {
    this.subscription.add(
      this.changelogService.changelogs$.subscribe((changelogs) => {
        this.changelogs = changelogs;
      })
    );

    this.users = await this.userService.getUsers()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  executor(changelog: Changelog): string {
    let maxChar = 30;
    if (!changelog.id_usuario) return 'Sistema';
    
    const user = this.users.find(u => u.id_usuario === changelog.id_usuario);
    let name = user ? user.nombre : 'Usuario desconocido';

    if(name.length > maxChar) {
      name = name.substring(0, maxChar - 3) + '...';
    }

    return name;
  }
}
