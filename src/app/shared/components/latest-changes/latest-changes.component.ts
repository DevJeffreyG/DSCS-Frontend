import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Changelog } from '../../interfaces/changelog';
import { ChangelogService } from '../../services/changelog.service';
import { Subscription } from 'rxjs';

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
  private subscription = new Subscription();

  constructor(private changelogService: ChangelogService) {}

  ngOnInit() {
    this.subscription.add(
      this.changelogService.changelogs$.subscribe((changelogs) => {
        this.changelogs = changelogs;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
