import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Vidalstore, Juego } from '../vidalstore/vidalstore';

const MENSAJES_HERO = [
  {
    titulo: 'Tu próximo juego favorito, con licencia revocable en cualquier momento',
    subtitulo: 'Ofertas de temporada, novedades y clásicos. Compra segura con identidad real.',
  },
  {
    titulo: 'Identidad real, cero contraseñas inventadas',
    subtitulo: 'Cada compra queda asociada a tu cuenta de verdad, verificada con AWS Cognito.',
  },
  {
    titulo: 'Tu biblioteca, siempre a un click',
    subtitulo: 'Revisa lo que compraste, cuando quieras, desde Mi biblioteca.',
  },
];

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnDestroy {
  private readonly vidalstore = inject(Vidalstore);

  protected readonly juegos = signal<Juego[]>([]);
  protected readonly estado = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly comprando = signal<string | null>(null);
  protected readonly comprado = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  protected readonly busqueda = signal('');
  protected readonly vistaLista = signal(false);

  protected readonly mensajesHero = MENSAJES_HERO;
  protected readonly heroIndex = signal(0);
  private heroTimer?: ReturnType<typeof setInterval>;

  protected readonly juegosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const lista = this.juegos();
    if (!texto) return lista;
    return lista.filter(
      (j) =>
        j.titulo.toLowerCase().includes(texto) ||
        j.genero.toLowerCase().includes(texto),
    );
  });

  protected readonly idOferta = computed(() => {
    const lista = this.juegos();
    if (lista.length === 0) return null;
    return lista.reduce((barato, j) => (j.precio < barato.precio ? j : barato), lista[0]).id;
  });

  protected readonly idNuevo = computed(() => {
    const lista = this.juegos();
    return lista.length > 0 ? lista[lista.length - 1].id : null;
  });

  constructor() {
    this.cargar();
    this.heroTimer = setInterval(() => {
      this.heroIndex.set((this.heroIndex() + 1) % this.mensajesHero.length);
    }, 6000);
  }

  ngOnDestroy() {
    if (this.heroTimer) clearInterval(this.heroTimer);
  }

  private cargar() {
    this.cargando.set(true);
    this.vidalstore.catalogo().subscribe({
      next: (juegos) => {
        this.juegos.set(juegos);
        this.estado.set(200);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.estado.set(e.status);
        this.cargando.set(false);
      },
    });
  }

  protected comprar(juego: Juego) {
    this.comprando.set(juego.id);
    this.mensaje.set(null);
    this.vidalstore.comprar(juego.id).subscribe({
      next: () => {
        this.comprando.set(null);
        this.comprado.set(juego.id);
        this.mensaje.set(`${juego.titulo} ya está en tu biblioteca.`);
        setTimeout(() => this.comprado.set(null), 1200);
      },
      error: (e: HttpErrorResponse) => {
        this.comprando.set(null);
        this.mensaje.set(`No se pudo comprar (HTTP ${e.status}).`);
      },
    });
  }
}