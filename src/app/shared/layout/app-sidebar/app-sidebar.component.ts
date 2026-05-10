import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  ChangeDetectorRef
} from '@angular/core';

import { SidebarService } from '../../services/sidebar.service';

import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';

import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { SidebarWidgetComponent } from './app-sidebar-widget.component';

import { combineLatest, Subscription } from 'rxjs';

import { LoggeduserService } from '../../services/loggeduser.service';
import { UserRole } from '../../enums/user-role';

type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean
  }[];
};

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    SafeHtmlPipe,
    SidebarWidgetComponent
  ],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {

  userRole!: UserRole;

  // =========================
  // MENU
  // =========================
  navItems: NavItem[] = [];

  // Others nav items
  othersItems: NavItem[] = [];

  openSubmenu: string | null | number = null;

  subMenuHeights: { [key: string]: number } = {};

  @ViewChildren('subMenu')
  subMenuRefs!: QueryList<ElementRef>;

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

    // =========================
    // OBTENER USUARIO
    // =========================
    const user: any = LoggeduserService.getUser();

    if (user) {

      this.userRole = user.rol;

    }

    // =========================
    // ITEMS BASE
    // =========================
    this.navItems = [

      {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"/></svg>`,
        name: "Dashboard",
        path: "/dashboard"
      },

      {
        icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5Z" fill="currentColor"></path></svg>`,
        name: "Servers",
        path: "/servers"
      }

    ];

    // =========================
    // SOLO ADMINISTRADOR
    // =========================
    if (this.userRole !== UserRole.Operator) {

      this.navItems.push({

        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C8.41421 2 8.75 2.33579 8.75 2.75V3.75H15.25V2.75C15.25 2.33579 15.5858 2 16 2C16.4142 2 16.75 2.33579 16.75 2.75V3.75H18.5C19.7426 3.75 20.75 4.75736 20.75 6V9V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19V9V6C3.25 4.75736 4.25736 3.75 5.5 3.75H7.25V2.75C7.25 2.33579 7.58579 2 8 2Z" fill="currentColor"></path></svg>`,

        name: "Configuración",

        path: "/config",

      });

    }

    // =========================
    // ROUTER
    // =========================
    this.subscription.add(

      this.router.events.subscribe(event => {

        if (event instanceof NavigationEnd) {

          this.setActiveMenuFromRoute(this.router.url);

        }

      })

    );

    this.subscription.add(

      combineLatest([
        this.isExpanded$,
        this.isMobileOpen$,
        this.isHovered$
      ]).subscribe(() => {

        this.cdr.detectChanges();

      })

    );

    this.setActiveMenuFromRoute(this.router.url);

  }

  ngOnDestroy() {

    this.subscription.unsubscribe();

  }

  isActive(path: string): boolean {

    return this.router.url === path;

  }

  toggleSubmenu(section: string, index: number) {

    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {

      this.openSubmenu = null;

      this.subMenuHeights[key] = 0;

    } else {

      this.openSubmenu = key;

      setTimeout(() => {

        const el = document.getElementById(key);

        if (el) {

          this.subMenuHeights[key] = el.scrollHeight;

          this.cdr.detectChanges();

        }

      });

    }

  }

  onSidebarMouseEnter() {

    this.isExpanded$.subscribe(expanded => {

      if (!expanded) {

        this.sidebarService.setHovered(true);

      }

    }).unsubscribe();

  }

  private setActiveMenuFromRoute(currentUrl: string) {

    const menuGroups = [

      { items: this.navItems, prefix: 'main' },

      { items: this.othersItems, prefix: 'others' },

    ];

    menuGroups.forEach(group => {

      group.items.forEach((nav, i) => {

        if (nav.subItems) {

          nav.subItems.forEach(subItem => {

            if (currentUrl === subItem.path) {

              const key = `${group.prefix}-${i}`;

              this.openSubmenu = key;

              setTimeout(() => {

                const el = document.getElementById(key);

                if (el) {

                  this.subMenuHeights[key] = el.scrollHeight;

                  this.cdr.detectChanges();

                }

              });

            }

          });

        }

      });

    });

  }

  onSubmenuClick() {

    this.isMobileOpen$.subscribe(isMobile => {

      if (isMobile) {

        this.sidebarService.setMobileOpen(false);

      }

    }).unsubscribe();

  }

}