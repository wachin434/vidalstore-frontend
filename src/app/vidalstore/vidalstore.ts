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

/** GET /v1/panel/en-vivo (EP3 E2). Las horas vienen en hora de Chile; `minuto` es el instante en UTC. */
export interface PanelEnVivo {
  zonaHoraria: string;
  generadoEn: string;
  hasta: string | null;
  totales: {
    partidasIniciadas: number;
    partidasTerminadas: number;
    partidasEnCurso: number;
    compras: number;
    montoComprasClp: number;
  };
  maximoEnCurso: { hora: string; partidas: number } | null;
  porMinuto: {
    minuto: string;
    hora: string;
    iniciadas: number;
    terminadas: number;
    enCurso: number;
    compras: number;
    montoClp: number;
  }[];
  porJuego: { juegoId: string; enCurso: number; compras: number }[];
  regla: { umbralError: number; minimoTerminadas: number; ventanaMinutos: number };
  alertas: { juegoId: string; desde: string; hasta: string; terminadas: number; enError: number; porcentaje: number }[];
  ventasSemana: {
    unidades: number;
    brutoClp: number;
    revocaciones: number;
    revocadoClp: number;
    netoClp: number;
    masVendido: { juegoId: string; unidades: number } | null;
    mayorRecaudo: { juegoId: string; montoClp: number } | null;
  };
}

export interface Licencia {
  id: string;
  juegoId: string;
  usuarioSub: string;
  compradoEn: string;
  revocada: boolean;
  revocadaEn?: string | null;
  revocadaPor?: string | null;
  juego?: Juego;
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
    motivo?: string,
  ): Observable<Licencia> {
    return this.http.delete<Licencia>(
      `${GATEWAY}/v1/licencias/${encodeURIComponent(licenciaId)}`,
      { body: { motivo } },
    );
  }

  /* ===================================================
     PANEL EN VIVO
     Solo administradores (el gateway responde 403 al resto)
  =================================================== */

  panelEnVivo(): Observable<PanelEnVivo> {
    return this.http.get<PanelEnVivo>(`${GATEWAY}/v1/panel/en-vivo`);
  }
}
