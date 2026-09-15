import { Injectable, signal } from '@angular/core';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export type Rol = 'jugadores' | 'editores' | 'administradores' | null;

// Servicio central de "quién soy": lo consultan la barra de navegación,
// el catálogo (botón publicar) y el panel de administración.
@Injectable({ providedIn: 'root' })
export class Sesion {
  readonly haySesion = signal(false);
  readonly grupos = signal<string[]>([]);
  readonly correo = signal<string | null>(null);

  constructor() {
    this.revisar();
    Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect' || payload.event === 'signedOut') {
        this.revisar();
      }
    });
  }

  esEditor(): boolean {
    return this.grupos().includes('editores') || this.grupos().includes('administradores');
  }

  esAdministrador(): boolean {
    return this.grupos().includes('administradores');
  }

  async salir() {
    await signOut();
  }

  private async revisar() {
    try {
      const { tokens } = await fetchAuthSession();
      const payload = tokens?.accessToken?.payload as Record<string, unknown> | undefined;
      this.haySesion.set(!!tokens?.accessToken);
      this.grupos.set((payload?.['cognito:groups'] as string[]) ?? []);
      this.correo.set((payload?.['username'] as string) ?? null);
    } catch {
      this.haySesion.set(false);
      this.grupos.set([]);
      this.correo.set(null);
    }
  }
}
