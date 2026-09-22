import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { fetchAuthSession } from 'aws-amplify/auth';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);

  try {
    const { tokens } = await fetchAuthSession();

    const payload = tokens?.accessToken?.payload as
      | Record<string, unknown>
      | undefined;

    const grupos =
      (payload?.['cognito:groups'] as string[] | undefined) ?? [];

    if (grupos.includes('administradores')) {
      return true;
    }
  } catch {
    // Si no se puede obtener la sesión, no se permite el acceso.
  }

  return router.createUrlTree(['/catalogo']);
};