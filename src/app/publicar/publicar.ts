import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Vidalstore, Juego } from '../vidalstore/vidalstore';
import { Sesion } from '../auth/sesion';

@Component({
  selector: 'app-publicar',
  imports: [FormsModule],
  templateUrl: './publicar.html',
  styleUrl: './publicar.css',
})
export class Publicar {
  private readonly vidalstore = inject(Vidalstore);
  protected readonly sesion = inject(Sesion);

  protected readonly juego: Partial<Juego> = {
    titulo: '',
    precio: 0,
    genero: '',
    portada: '',
    descripcion: '',
  };

  protected readonly enviando = signal(false);
  protected readonly resultado = signal<{ ok: boolean; mensaje: string } | null>(null);

  protected publicar() {
    this.enviando.set(true);
    this.resultado.set(null);
    this.vidalstore.publicarJuego(this.juego).subscribe({
      next: (creado) => {
        this.enviando.set(false);
        this.resultado.set({ ok: true, mensaje: `"${creado.titulo}" publicado.` });
      },
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        const razon =
          e.status === 403
            ? 'te falta el grupo editores/administradores'
            : `HTTP ${e.status}`;
        this.resultado.set({ ok: false, mensaje: `No se pudo publicar (${razon}).` });
      },
    });
  }
}