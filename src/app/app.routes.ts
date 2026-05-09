import { Routes } from '@angular/router';

import { ServersComponent } from './pages/servers/servers.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';

import { authGuard } from './guards/auth.guard';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { ConfigComponent } from './pages/config/config.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [

  // Redirección inicial
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Login
  {
    path: 'signin',
    component: SignInComponent
  },
  // Layout principal protegido
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],

    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard'
      },
      {
        path: 'servers',
        component: ServersComponent,
        title: 'Panel de Servidores'
      },
      {
        path: 'monitor/:id',
        component: MonitorComponent,
        title: 'Monitor de Servidor'
      },
      {
        path: 'config',
        component: ConfigComponent,
        title: 'Configuración'
      }
    ]
  },

  // Página no encontrada
  {
    path: '**',
    component: NotFoundComponent
  }

];