import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Vidalstore, Licencia, RegistroAuditoria } from '../vidalstore/vidalstore';

@Component({
  selector: 'app-licencias',
  imports: [DatePipe],
  templateUrl: './licencias.html',
  styleUrl: './licencias.css',
})
export class Licencias {
  private readonly vidalstore = inject(Vidalstore);

  protected readonly licencias = signal<Licencia[]>([]);
  protected readonly auditoria = signal<RegistroAuditoria[]>([]);
  protected readonly estado = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly revocando = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.cargando.set(true);
    this.vidalstore.todasLasLicencias().subscribe({
      next: (licencias) => {
        this.licencias.set(licencias);
        this.estado.set(200);
        this.cargando.set(false);
        this.vidalstore.auditoria().subscribe({ next: (a) => this.auditoria.set(a) });
      },
      error: (e: HttpErrorResponse) => {
        this.estado.set(e.status);
        this.cargando.set(false);
      },
    });
  }

  protected revocar(licencia: Licencia) {
    this.revocando.set(licencia.id);
    this.vidalstore.revocar(licencia.id).subscribe({
      next: () => {
        this.revocando.set(null);
        this.cargar();
      },
      error: () => this.revocando.set(null),
    });
  }
}