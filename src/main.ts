import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
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

bootstrapApplication(App, appConfig).catch((err) => console.error(err));