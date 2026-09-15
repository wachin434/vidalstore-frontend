import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Vidalstore, Licencia } from '../vidalstore/vidalstore';

@Component({
  selector: 'app-biblioteca',
  imports: [DatePipe],
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.css',
})
export class Biblioteca {
  private readonly vidalstore = inject(Vidalstore);

  protected readonly licencias = signal<Licencia[]>([]);
  protected readonly estado = signal<number | null>(null);
  protected readonly cargando = signal(true);

  constructor() {
    this.vidalstore.miBiblioteca().subscribe({
      next: (licencias) => {
        this.licencias.set(licencias);
        this.estado.set(200);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.estado.set(e.status);
        this.cargando.set(false);
      },
    });
  }
}