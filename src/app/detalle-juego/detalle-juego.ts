import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { Vidalstore, Juego } from '../vidalstore/vidalstore';

interface Resena {
  usuario: string;
  estrellas: number;
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-detalle-juego',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './detalle-juego.html',
  styleUrl: './detalle-juego.css',
})
export class DetalleJuego {
  private readonly ruta = inject(ActivatedRoute);
  private readonly vidalstore = inject(Vidalstore);

  protected readonly todos = signal<Juego[]>([]);
  protected readonly estado = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly comprando = signal(false);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly imagenActiva = signal(0);
  protected readonly rango5 = [1, 2, 3, 4, 5];
  protected readonly yaComprados = signal<Set<string>>(new Set());

  private readonly idActual = toSignal(
    this.ruta.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly juego = computed(() =>
    this.todos().find((j) => j.id === this.idActual()) ?? null,
  );

  protected readonly yaLoTiene = computed(() => {
    const j = this.juego();
    return j ? this.yaComprados().has(j.id) : false;
  });

  protected readonly galeria = computed(() => {
    const j = this.juego();
    if (!j) return [];
    const base = j.portada.split('?')[0];
    return [
      `${base}?w=900`,
      `${base}?w=900&sat=-60`,
      `${base}?w=900&blend=6d28d9&blend-mode=multiply`,
      `${base}?w=900&flip=h`,
    ];
  });

  protected readonly relacionados = computed(() => {
    const j = this.juego();
    const lista = this.todos();
    if (!j) return [];
    const mismoGenero = lista.filter((x) => x.id !== j.id && x.genero === j.genero);
    const resto = lista.filter((x) => x.id !== j.id && x.genero !== j.genero);
    return [...mismoGenero, ...resto].slice(0, 3);
  });

  protected readonly resenas: Resena[] = [
    { usuario: 'PixelWanderer', estrellas: 5, comentario: 'Se siente distinto a todo lo demás. Lo recomiendo sin dudar.', fecha: 'hace 3 días' },
    { usuario: 'RetroGamerCL', estrellas: 4, comentario: 'Muy buena experiencia, aunque esperaba un poco más de contenido.', fecha: 'hace 1 semana' },
    { usuario: 'invitado_777', estrellas: 5, comentario: 'La licencia revocable me tenía nervioso, pero el trato fue justo.', fecha: 'hace 2 semanas' },
  ];

  protected readonly promedioEstrellas = computed(() => {
    const suma = this.resenas.reduce((acc, r) => acc + r.estrellas, 0);
    return Math.round((suma / this.resenas.length) * 10) / 10;
  });

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.cargando.set(true);
    this.vidalstore.catalogo().subscribe({
      next: (juegos) => {
        this.todos.set(juegos);
        this.estado.set(200);
        this.cargando.set(false);
        this.cargarBibliotecaPropia();
      },
      error: (e: HttpErrorResponse) => {
        this.estado.set(e.status);
        this.cargando.set(false);
      },
    });
  }

  private cargarBibliotecaPropia() {
    this.vidalstore.miBiblioteca().subscribe({
      next: (licencias) => {
        const ids = new Set(licencias.map((l) => l.juegoId));
        this.yaComprados.set(ids);
      },
      error: () => {
        // Si falla, no rompe el detalle: solo no se marca como ya comprado.
      },
    });
  }

  protected comprar() {
    const j = this.juego();
    if (!j) return;
    this.comprando.set(true);
    this.mensaje.set(null);
    this.vidalstore.comprar(j.id).subscribe({
      next: () => {
        this.comprando.set(false);
        this.yaComprados.update((set) => new Set(set).add(j.id));
        this.mensaje.set(`${j.titulo} ya está en tu biblioteca.`);
      },
      error: (e: HttpErrorResponse) => {
        this.comprando.set(false);
        if (e.status === 409) {
          this.yaComprados.update((set) => new Set(set).add(j.id));
          this.mensaje.set(`Ya tienes "${j.titulo}" en tu biblioteca.`);
        } else {
          this.mensaje.set(`No se pudo comprar (HTTP ${e.status}).`);
        }
      },
    });
  }
}