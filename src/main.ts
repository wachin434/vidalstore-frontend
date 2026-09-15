import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
// Sin esto, Amplify no termina el canje del ?code= al volver de Cognito.
// Tiene que importarse ANTES de que exista el primer componente.
import 'aws-amplify/auth/enable-oauth-listener';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// TODO: reemplaza estos 4 valores por los que te imprimió
// backend/scripts/crear-user-pool.sh (o los que sacaste a mano de la consola).
// Ninguno es secreto: un cliente público (SPA) no tiene client secret.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_XXXXXXXXX',
      userPoolClientId: 'TU_CLIENT_ID',
      loginWith: {
        oauth: {
          domain: 'tu-dominio.auth.us-east-1.amazoncognito.com',
          scopes: [
            'openid',
            'profile',
            'vidalstore/catalogo.leer',
            'vidalstore/catalogo.escribir',
            'vidalstore/biblioteca.leer',
          ],
          redirectSignIn: ['http://localhost:4200/callback'],
          redirectSignOut: ['http://localhost:4200'],
          responseType: 'code',
        },
      },
    },
  },
});

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
