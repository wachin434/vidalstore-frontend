import { CanActivateFn } from '@angular/router';
import { fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';

// Protege /catalogo, /biblioteca, /publicar y /admin. /callback NUNCA
// lleva este guard: es la página a la que Cognito devuelve el navegador
// antes de que exista sesión, y ponérselo produce un bucle infinito.
export const sesionGuard: CanActivateFn = async () => {
  const { tokens } = await fetchAuthSession();
  if (tokens?.accessToken) return true;

  await signInWithRedirect();
  return false;
};
