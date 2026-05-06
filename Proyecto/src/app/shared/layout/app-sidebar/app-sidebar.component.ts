import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';

import { SidebarService } from '../../services/sidebar.service';
import { combineLatest, Subscription } from 'rxjs';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {

  // MENU PRINCIPAL
  navItems: NavItem[] = [
    {
      icon: `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none">

        <path
          d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V8C20 9.10457 19.1046 10 18 10H6C4.89543 10 4 9.10457 4 8V5Z"
          fill="currentColor"
        />

        <path
          d="M4 16C4 14.8954 4.89543 14 6 14H18C19.1046 14 20 14.8954 20 16V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V16Z"
          fill="currentColor"
        />
      </svg>
      `,
      name: 'Servidores',
      path: '/dashboard'
    }
  ];

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  private subscription: Subscription = new Subscription();

  constructor(
    public sidebarService: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isHovered$ = this.sidebarService.isHovered$;
  }

  ngOnInit() {

    // Detectar cambio de ruta
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.cdr.detectChanges();
        }
      })
    );

    // Detectar cambios del sidebar
    this.subscription.add(
      combineLatest([
        this.isExpanded$,
        this.isMobileOpen$,
        this.isHovered$
      ]).subscribe(() => {
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  onSidebarMouseEnter() {
    this.isExpanded$
      .subscribe(expanded => {
        if (!expanded) {
          this.sidebarService.setHovered(true);
        }
      })
      .unsubscribe();
  }

  onMenuClick() {
    this.isMobileOpen$
      .subscribe(isMobile => {
        if (isMobile) {
          this.sidebarService.setMobileOpen(false);
        }
      })
      .unsubscribe();
  }
}