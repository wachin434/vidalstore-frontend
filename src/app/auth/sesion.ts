import { Injectable, signal } from '@angular/core';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export type Rol = 'jugadores' | 'editores' | 'administradores' | null;

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
      const payloadAccess = tokens?.accessToken?.payload as Record<string, unknown> | undefined;
      const payloadId = tokens?.idToken?.payload as Record<string, unknown> | undefined;

      this.haySesion.set(!!tokens?.accessToken);
      this.grupos.set((payloadAccess?.['cognito:groups'] as string[]) ?? []);
      this.correo.set((payloadId?.['email'] as string) ?? null);
    } catch {
      this.haySesion.set(false);
      this.grupos.set([]);
      this.correo.set(null);
    }
  }
}