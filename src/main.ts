import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { sessionStorage as amplifySessionStorage } from 'aws-amplify/utils';
import 'aws-amplify/auth/enable-oauth-listener';
import { appConfig } from './app/app.config';
import { App } from './app/app';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_AlNoSjUqI',
      userPoolClientId: '3ojf293vgqvl0vodr0tgsabamp',
      loginWith: {
        oauth: {
          domain: 'vidalstore-cloudshelluser-30800.auth.us-east-1.amazoncognito.com',
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

// Por defecto Amplify guarda los tokens en localStorage (persisten entre
// pestañas y entre cierres del navegador). Los movemos a sessionStorage:
// se borran al cerrar la pestaña, así se reduce la ventana de exposición
// si hay un XSS, aunque el interceptor con lista blanca ya mitiga el
// riesgo principal (ver README, sección "Dónde queda el token").
// Debe llamarse ANTES de cualquier operación de auth, por eso va aquí,
// entre Amplify.configure y bootstrapApplication.
cognitoUserPoolsTokenProvider.setKeyValueStorage(amplifySessionStorage);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
