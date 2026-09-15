import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Juego {
  id: string;
  titulo: string;
  precio: number;
  genero: string;
  portada: string;
  descripcion: string;
}

export interface Licencia {
  id: string;
  juegoId: string;
  usuarioSub: string;
  compradoEn: string;
  revocada: boolean;
  juego?: Juego;
}

export interface RegistroAuditoria {
  id: string;
  accion: string;
  licenciaId: string;
  juegoId: string;
  adminSub: string;
  usuarioSub: string;
  fecha: string;
}

const GATEWAY = 'http://localhost:8080';

// Este servicio no sabe nada de tokens: eso es trabajo del interceptor.
@Injectable({ providedIn: 'root' })
export class Vidalstore {
  private readonly http = inject(HttpClient);

  catalogo(): Observable<Juego[]> {
    return this.http.get<Juego[]>(`${GATEWAY}/v1/catalogo`);
  }

  publicarJuego(juego: Partial<Juego>): Observable<Juego> {
    return this.http.post<Juego>(`${GATEWAY}/v1/catalogo`, juego);
  }

  editarJuego(id: string, cambios: Partial<Juego>): Observable<Juego> {
    return this.http.put<Juego>(`${GATEWAY}/v1/catalogo/${id}`, cambios);
  }

  comprar(juegoId: string): Observable<{ licencia: Licencia; juego: Juego }> {
    return this.http.post<{ licencia: Licencia; juego: Juego }>(`${GATEWAY}/v1/compras`, { juegoId });
  }

  miBiblioteca(): Observable<Licencia[]> {
    return this.http.get<Licencia[]>(`${GATEWAY}/v1/biblioteca`);
  }

  todasLasLicencias(): Observable<Licencia[]> {
    return this.http.get<Licencia[]>(`${GATEWAY}/v1/licencias`);
  }

  revocar(licenciaId: string): Observable<Licencia> {
    return this.http.delete<Licencia>(`${GATEWAY}/v1/licencias/${licenciaId}`);
  }

  auditoria(): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(`${GATEWAY}/v1/auditoria`);
  }
}