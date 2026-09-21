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
  activo?: boolean;
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

@Injectable({
  providedIn: 'root',
})
export class Vidalstore {
  private readonly http =
    inject(HttpClient);

  /* ===================================================
     CATÁLOGO
  =================================================== */

  catalogo(): Observable<Juego[]> {
    return this.http.get<Juego[]>(
      `${GATEWAY}/v1/catalogo`,
    );
  }

  /* ===================================================
     PUBLICAR JUEGO
  =================================================== */

  publicarJuego(
    juego: Partial<Juego>,
  ): Observable<Juego> {
    return this.http.post<Juego>(
      `${GATEWAY}/v1/catalogo`,
      juego,
    );
  }

  /* ===================================================
     EDITAR JUEGO
  =================================================== */

  editarJuego(
    id: string,
    cambios: Partial<Juego>,
  ): Observable<Juego> {
    return this.http.put<Juego>(
      `${GATEWAY}/v1/catalogo/${encodeURIComponent(id)}`,
      cambios,
    );
  }

  /* ===================================================
     ELIMINAR JUEGO
  =================================================== */

  eliminarJuego(
    id: string,
  ): Observable<{
    mensaje: string;
    juego: Juego;
  }> {
    return this.http.delete<{
      mensaje: string;
      juego: Juego;
    }>(
      `${GATEWAY}/v1/catalogo/${encodeURIComponent(id)}`,
    );
  }

  /* ===================================================
     COMPRAR JUEGO
  =================================================== */

  comprar(
    juegoId: string,
  ): Observable<{
    licencia: Licencia;
    juego: Juego;
  }> {
    return this.http.post<{
      licencia: Licencia;
      juego: Juego;
    }>(
      `${GATEWAY}/v1/compras`,
      {
        juegoId,
      },
    );
  }

  /* ===================================================
     MI BIBLIOTECA
  =================================================== */

  miBiblioteca(): Observable<
    Licencia[]
  > {
    return this.http.get<
      Licencia[]
    >(
      `${GATEWAY}/v1/biblioteca`,
    );
  }

  /* ===================================================
     TODAS LAS LICENCIAS
     Solo administradores
  =================================================== */

  todasLasLicencias(): Observable<
    Licencia[]
  > {
    return this.http.get<
      Licencia[]
    >(
      `${GATEWAY}/v1/licencias`,
    );
  }

  /* ===================================================
     REVOCAR LICENCIA
     Solo administradores
  =================================================== */

  revocar(
    licenciaId: string,
  ): Observable<Licencia> {
    return this.http.delete<Licencia>(
      `${GATEWAY}/v1/licencias/${encodeURIComponent(licenciaId)}`,
    );
  }

  /* ===================================================
     AUDITORÍA
     Solo administradores
  =================================================== */

  auditoria(): Observable<
    RegistroAuditoria[]
  > {
    return this.http.get<
      RegistroAuditoria[]
    >(
      `${GATEWAY}/v1/auditoria`,
    );
  }
}