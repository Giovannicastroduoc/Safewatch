import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'rondas',
    loadComponent: () => import('./pages/rondas/rondas.page').then(m => m.RondasPage)
  },
  {
    path: 'incidentes',
    loadComponent: () => import('./pages/incidentes/incidentes.page').then(m => m.IncidentesPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
  },

  //ruta redireccion
  { path: '**', redirectTo: 'login' },
];
