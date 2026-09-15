import { Routes } from '@angular/router';
import { Catalogo } from './catalogo/catalogo';
import { Biblioteca } from './biblioteca/biblioteca';
import { Publicar } from './publicar/publicar';
import { Licencias } from './admin/licencias';
import { Callback } from './callback/callback';
import { sesionGuard } from './auth/sesion.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: 'catalogo', component: Catalogo, canActivate: [sesionGuard] },
  { path: 'biblioteca', component: Biblioteca, canActivate: [sesionGuard] },
  { path: 'publicar', component: Publicar, canActivate: [sesionGuard] },
  { path: 'admin', component: Licencias, canActivate: [sesionGuard] },
  { path: 'callback', component: Callback },
];