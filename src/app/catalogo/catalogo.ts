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
     EDICIÓN COMPLETA DEL JUEGO
  =================================================== */

  protected readonly editandoJuego =
    signal<string | null>(null);

  protected readonly tituloEditado =
    signal('');

  protected readonly precioEditado =
    signal<number | null>(null);

  protected readonly generoEditado =
    signal('');

  protected readonly portadaEditada =
    signal('');

  protected readonly descripcionEditada =
    signal('');

  protected readonly guardandoEdicion =
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
     COMENZAR EDICIÓN
  =================================================== */

  protected empezarEdicion(
    juego: Juego,
  ) {
    if (!this.sesion.esEditor()) {
      return;
    }

    this.editandoJuego.set(
      juego.id,
    );

    this.tituloEditado.set(
      juego.titulo,
    );

    this.precioEditado.set(
      juego.precio,
    );

    this.generoEditado.set(
      juego.genero,
    );

    this.portadaEditada.set(
      juego.portada,
    );

    this.descripcionEditada.set(
      juego.descripcion ?? '',
    );

    this.mensaje.set(null);
  }

  /* ===================================================
     CANCELAR EDICIÓN
  =================================================== */

  protected cancelarEdicion() {
    this.editandoJuego.set(null);

    this.tituloEditado.set('');

    this.precioEditado.set(null);

    this.generoEditado.set('');

    this.portadaEditada.set('');

    this.descripcionEditada.set('');
  }

  /* ===================================================
     GUARDAR EDICIÓN
  =================================================== */

  protected guardarEdicion(
    juego: Juego,
  ) {
    if (!this.sesion.esEditor()) {
      return;
    }

    const titulo =
      this.tituloEditado().trim();

    const genero =
      this.generoEditado().trim();

    const portada =
      this.portadaEditada().trim();

    const descripcion =
      this.descripcionEditada().trim();

    const precio =
      Number(
        this.precioEditado(),
      );

    if (!titulo) {
      this.mensaje.set(
        'El título no puede estar vacío.',
      );
      return;
    }

    if (
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      this.mensaje.set(
        'El precio debe ser un número válido.',
      );
      return;
    }

    if (!genero) {
      this.mensaje.set(
        'El género no puede estar vacío.',
      );
      return;
    }

    if (!portada) {
      this.mensaje.set(
        'La URL de la imagen no puede estar vacía.',
      );
      return;
    }

    this.guardandoEdicion.set(
      true,
    );

    this.mensaje.set(null);

    this.vidalstore
      .editarJuego(
        juego.id,
        {
          titulo,
          precio,
          genero,
          portada,
          descripcion,
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
                        ...actualizado,
                      }
                    : actual,
              ),
          );

          this.guardandoEdicion.set(
            false,
          );

          this.cancelarEdicion();

          this.mensaje.set(
            `"${actualizado.titulo}" fue actualizado correctamente.`,
          );
        },

        error: (
          e: HttpErrorResponse,
        ) => {
          this.guardandoEdicion.set(
            false,
          );

          if (e.status === 403) {
            this.mensaje.set(
              'No tienes permisos para editar juegos.',
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
              'El juego fue eliminado y ya no puede editarse.',
            );
            return;
          }

          this.mensaje.set(
            `No se pudo editar el juego (HTTP ${e.status}).`,
          );
        },
      });
  }

  /* ===================================================
     ELIMINAR JUEGO
     Solo administrador
  =================================================== */

  protected eliminarJuego(
    juego: Juego,
  ) {
    if (
      !this.sesion.esAdministrador()
    ) {
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

          if (
            this.editandoJuego() ===
            juego.id
          ) {
            this.cancelarEdicion();
          }

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
              'Solo los administradores pueden eliminar juegos.',
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