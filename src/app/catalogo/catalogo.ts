import {
  Component,
  inject,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Vidalstore,
  Juego,
} from '../vidalstore/vidalstore';

import { Sesion } from '../auth/sesion';

const MENSAJES_HERO = [
  {
    titulo:
      'Tu próximo juego favorito, con licencia revocable en cualquier momento',
    subtitulo:
      'Ofertas de temporada, novedades y clásicos. Compra segura con identidad real.',
  },
  {
    titulo:
      'Identidad real, cero contraseñas inventadas',
    subtitulo:
      'Cada compra queda asociada a tu cuenta de verdad, verificada con AWS Cognito.',
  },
  {
    titulo:
      'Tu biblioteca, siempre a un click',
    subtitulo:
      'Revisa lo que compraste, cuando quieras, desde Mi biblioteca.',
  },
];

@Component({
  selector: 'app-catalogo',
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnDestroy {
  private readonly vidalstore =
    inject(Vidalstore);

  protected readonly sesion =
    inject(Sesion);

  /* ===================================================
     CATÁLOGO
  =================================================== */

  protected readonly juegos =
    signal<Juego[]>([]);

  protected readonly estado =
    signal<number | null>(null);

  protected readonly cargando =
    signal(true);

  /* ===================================================
     COMPRA
  =================================================== */

  protected readonly comprando =
    signal<string | null>(null);

  protected readonly comprado =
    signal<string | null>(null);

  protected readonly yaComprados =
    signal<Set<string>>(new Set());

  /* ===================================================
     MENSAJES
  =================================================== */

  protected readonly mensaje =
    signal<string | null>(null);

  /* ===================================================
     BÚSQUEDA Y VISTA
  =================================================== */

  protected readonly busqueda =
    signal('');

  protected readonly vistaLista =
    signal(false);

  /* ===================================================
     HERO
  =================================================== */

  protected readonly mensajesHero =
    MENSAJES_HERO;

  protected readonly heroIndex =
    signal(0);

  private heroTimer?:
    ReturnType<typeof setInterval>;

  /* ===================================================
     EDICIÓN DE PORTADA
  =================================================== */

  protected readonly editandoPortada =
    signal<string | null>(null);

  protected readonly urlNueva =
    signal('');

  protected readonly guardandoPortada =
    signal(false);

  /* ===================================================
     ELIMINACIÓN
  =================================================== */

  protected readonly eliminando =
    signal<string | null>(null);

  /* ===================================================
     CATÁLOGO FILTRADO
  =================================================== */

  protected readonly juegosFiltrados =
    computed(() => {
      const texto =
        this.busqueda()
          .trim()
          .toLowerCase();

      const lista =
        this.juegos();

      if (!texto) {
        return lista;
      }

      return lista.filter(
        (juego) =>
          juego.titulo
            .toLowerCase()
            .includes(texto) ||
          juego.genero
            .toLowerCase()
            .includes(texto),
      );
    });

  /* ===================================================
     JUEGO EN OFERTA
  =================================================== */

  protected readonly idOferta =
    computed(() => {
      const lista =
        this.juegos();

      if (lista.length === 0) {
        return null;
      }

      return lista.reduce(
        (barato, juego) =>
          juego.precio <
          barato.precio
            ? juego
            : barato,
        lista[0],
      ).id;
    });

  /* ===================================================
     JUEGO NUEVO
  =================================================== */

  protected readonly idNuevo =
    computed(() => {
      const lista =
        this.juegos();

      return lista.length > 0
        ? lista[lista.length - 1].id
        : null;
    });

  constructor() {
    this.cargar();

    this.heroTimer =
      setInterval(() => {
        this.heroIndex.set(
          (this.heroIndex() + 1) %
            this.mensajesHero.length,
        );
      }, 6000);
  }

  ngOnDestroy() {
    if (this.heroTimer) {
      clearInterval(
        this.heroTimer,
      );
    }
  }

  /* ===================================================
     CARGAR CATÁLOGO
  =================================================== */

  private cargar() {
    this.cargando.set(true);

    this.vidalstore
      .catalogo()
      .subscribe({
        next: (juegos) => {
          this.juegos.set(juegos);

          this.estado.set(200);

          this.cargando.set(false);

          this.cargarBibliotecaPropia();
        },

        error: (
          e: HttpErrorResponse,
        ) => {
          this.estado.set(
            e.status,
          );

          this.cargando.set(
            false,
          );
        },
      });
  }

  /* ===================================================
     CARGAR BIBLIOTECA DEL USUARIO
  =================================================== */

  private cargarBibliotecaPropia() {
    this.vidalstore
      .miBiblioteca()
      .subscribe({
        next: (licencias) => {
          const ids =
            new Set(
              licencias.map(
                (licencia) =>
                  licencia.juegoId,
              ),
            );

          this.yaComprados.set(
            ids,
          );
        },

        error: () => {
          // El catálogo puede seguir funcionando
          // aunque falle esta comprobación.
        },
      });
  }

  /* ===================================================
     COMPRAR
  =================================================== */

  protected comprar(
    juego: Juego,
  ) {
    this.comprando.set(
      juego.id,
    );

    this.mensaje.set(null);

    this.vidalstore
      .comprar(juego.id)
      .subscribe({
        next: () => {
          this.comprando.set(
            null,
          );

          this.comprado.set(
            juego.id,
          );

          this.yaComprados.update(
            (setActual) => {
              const nuevo =
                new Set(
                  setActual,
                );

              nuevo.add(
                juego.id,
              );

              return nuevo;
            },
          );

          this.mensaje.set(
            `${juego.titulo} ya está en tu biblioteca.`,
          );

          setTimeout(
            () =>
              this.comprado.set(
                null,
              ),
            1200,
          );
        },

        error: (
          e: HttpErrorResponse,
        ) => {
          this.comprando.set(
            null,
          );

          if (e.status === 409) {
            this.yaComprados.update(
              (setActual) => {
                const nuevo =
                  new Set(
                    setActual,
                  );

                nuevo.add(
                  juego.id,
                );

                return nuevo;
              },
            );

            this.mensaje.set(
              `Ya tienes "${juego.titulo}" en tu biblioteca.`,
            );
          } else {
            this.mensaje.set(
              `No se pudo comprar (HTTP ${e.status}).`,
            );
          }
        },
      });
  }

  /* ===================================================
     EDITAR PORTADA
  =================================================== */

  protected empezarEdicionPortada(
    juego: Juego,
  ) {
    this.editandoPortada.set(
      juego.id,
    );

    this.urlNueva.set(
      juego.portada,
    );
  }

  protected cancelarEdicionPortada() {
    this.editandoPortada.set(
      null,
    );

    this.urlNueva.set('');
  }

  protected guardarPortada(
    juego: Juego,
  ) {
    const url =
      this.urlNueva().trim();

    if (!url) {
      return;
    }

    this.guardandoPortada.set(
      true,
    );

    this.vidalstore
      .editarJuego(
        juego.id,
        {
          portada: url,
        },
      )
      .subscribe({
        next: (
          actualizado,
        ) => {
          this.juegos.update(
            (lista) =>
              lista.map(
                (actual) =>
                  actual.id ===
                  juego.id
                    ? {
                        ...actual,
                        portada:
                          actualizado.portada,
                      }
                    : actual,
              ),
          );

          this.guardandoPortada.set(
            false,
          );

          this.editandoPortada.set(
            null,
          );

          this.urlNueva.set('');

          this.mensaje.set(
            `Imagen de "${juego.titulo}" actualizada.`,
          );
        },

        error: (
          e: HttpErrorResponse,
        ) => {
          this.guardandoPortada.set(
            false,
          );

          this.mensaje.set(
            `No se pudo cambiar la imagen (HTTP ${e.status}).`,
          );
        },
      });
  }

  /* ===================================================
     ELIMINAR JUEGO
  =================================================== */

  protected eliminarJuego(
    juego: Juego,
  ) {
    if (!this.sesion.esEditor()) {
      return;
    }

    const confirmar =
      window.confirm(
        `¿Seguro que quieres eliminar "${juego.titulo}" del catálogo?\n\nEl juego dejará de aparecer en la tienda, pero no se eliminarán las licencias existentes.`,
      );

    if (!confirmar) {
      return;
    }

    this.eliminando.set(
      juego.id,
    );

    this.mensaje.set(null);

    this.vidalstore
      .eliminarJuego(
        juego.id,
      )
      .subscribe({
        next: () => {
          this.juegos.update(
            (lista) =>
              lista.filter(
                (actual) =>
                  actual.id !==
                  juego.id,
              ),
          );

          this.eliminando.set(
            null,
          );

          this.editandoPortada.set(
            null,
          );

          this.mensaje.set(
            `"${juego.titulo}" fue eliminado del catálogo.`,
          );
        },

        error: (
          e: HttpErrorResponse,
        ) => {
          this.eliminando.set(
            null,
          );

          if (e.status === 403) {
            this.mensaje.set(
              'No tienes permisos para eliminar juegos.',
            );

            return;
          }

          if (e.status === 404) {
            this.mensaje.set(
              'El juego ya no existe.',
            );

            return;
          }

          if (e.status === 409) {
            this.mensaje.set(
              'El juego ya había sido eliminado.',
            );

            return;
          }

          this.mensaje.set(
            `No se pudo eliminar el juego (HTTP ${e.status}).`,
          );
        },
      });
  }
}