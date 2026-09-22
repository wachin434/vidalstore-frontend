import {
  Routes,
} from '@angular/router';

import {
  Catalogo,
} from './catalogo/catalogo';

import {
  Biblioteca,
} from './biblioteca/biblioteca';

import {
  Publicar,
} from './publicar/publicar';

import {
  Licencias,
} from './admin/licencias';

import {
  Callback,
} from './callback/callback';

import {
  NoEncontrado,
} from './no-encontrado/no-encontrado';

import {
  DetalleJuego,
} from './detalle-juego/detalle-juego';

import {
  sesionGuard,
} from './auth/sesion.guard';

import {
  editorGuard,
} from './auth/editor.guard';

import {
  adminGuard,
} from './auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalogo',
    pathMatch: 'full',
  },

  {
    path: 'catalogo',
    component: Catalogo,
    canActivate: [
      sesionGuard,
    ],
  },

  {
    path: 'catalogo/:id',
    component:
      DetalleJuego,
    canActivate: [
      sesionGuard,
    ],
  },

  {
    path: 'biblioteca',
    component:
      Biblioteca,
    canActivate: [
      sesionGuard,
    ],
  },

  {
    path: 'publicar',
    component: Publicar,
    canActivate: [
      sesionGuard,
      editorGuard,
    ],
  },

  {
    path: 'admin',
    component: Licencias,
    canActivate: [
      sesionGuard,
      adminGuard,
    ],
  },

  {
    path: 'callback',
    component: Callback,
  },

  {
    path: '**',
    component:
      NoEncontrado,
  },
];