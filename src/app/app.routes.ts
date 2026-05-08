import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';

import { authGuard } from './guards/auth.guard';
import { MonitorComponent } from './pages/monitor/monitor.component';
import { ConfigComponent } from './pages/config/config.component';

export const routes: Routes = [

  // Redirección inicial
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },

  // Login
  {
    path: 'signin',
    component: SignInComponent
  },

  // Registro
  {
    path: 'signup',
    component: SignUpComponent
  },

  // Layout principal protegido
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],

    children: [

      // Dashboard principal de servidores
      {
        path: 'dashboard',
        component: DashboardComponent,
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
      },
      {
        path: 'calendar',
        component: CalenderComponent
      },

      {
        path: 'profile',
        component: ProfileComponent
      },

      {
        path: 'form-elements',
        component: FormElementsComponent
      },

      {
        path: 'basic-tables',
        component: BasicTablesComponent
      },

      {
        path: 'blank',
        component: BlankComponent
      },

      {
        path: 'invoice',
        component: InvoicesComponent
      },

      {
        path: 'line-chart',
        component: LineChartComponent
      },

      {
        path: 'bar-chart',
        component: BarChartComponent
      },

      {
        path: 'alerts',
        component: AlertsComponent
      },

      {
        path: 'avatars',
        component: AvatarElementComponent
      },

      {
        path: 'badge',
        component: BadgesComponent
      },

      {
        path: 'buttons',
        component: ButtonsComponent
      },

      {
        path: 'images',
        component: ImagesComponent
      },

      {
        path: 'videos',
        component: VideosComponent
      }

    ]
  },

  // Página no encontrada
  {
    path: '**',
    component: NotFoundComponent
  }

];