import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Vidalstore, Juego } from '../vidalstore/vidalstore';

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private readonly vidalstore = inject(Vidalstore);

  protected readonly juegos = signal<Juego[]>([]);
  protected readonly estado = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly comprando = signal<string | null>(null);
  protected readonly mensaje = signal<string | null>(null);

  constructor() {
    this.cargar();
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
        this.mensaje.set(`${juego.titulo} ya está en tu biblioteca.`);
      },
      error: (e: HttpErrorResponse) => {
        this.comprando.set(null);
        this.mensaje.set(`No se pudo comprar (HTTP ${e.status}).`);
      },
    });
  }
}