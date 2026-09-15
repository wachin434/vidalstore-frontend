import { HttpInterceptorFn } from '@angular/common/http';
import { fetchAuthSession } from 'aws-amplify/auth';
import { from, switchMap } from 'rxjs';

// Lista blanca explícita (punto 4.4: "aunque hoy tenga una sola entrada").
// Regalar el access token a cualquier tercero (una API de estadísticas,
// un CDN) es regalar la identidad del usuario. Esto es, textualmente,
// el hallazgo 5 del informe forense de VidalCasino.
const PERMITIDOS = ['http://localhost:8080'];

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!PERMITIDOS.some((base) => req.url.startsWith(base))) {
    return next(req);
  }

  return from(fetchAuthSession()).pipe(
    switchMap(({ tokens }) => {
      const jwt = tokens?.accessToken?.toString();
      return next(jwt ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } }) : req);
    }),
  );
};
