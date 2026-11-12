import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, switchMap, timer } from 'rxjs';
import { PanelEnVivo, Vidalstore } from '../vidalstore/vidalstore';

const CADA_MS = 5000;
const FORMATO_CLP = new Intl.NumberFormat('es-CL'); // 6.291.370, sin cargar datos de locale de Angular

/**
 * El panel en vivo (EP3 E2). Pide GET /v1/panel/en-vivo al gateway cada 5 segundos. Con el simulador a
 * --velocidad 60, cada refresco avanza unos cinco minutos de la venta de verano.
 *
 * Solo para administradores: el gateway responde 403 a cualquier otro y aca se muestra ese 403 tal cual.
 */
@Component({
  selector: 'app-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  private readonly vidalstore = inject(Vidalstore);

  protected readonly datos = signal<PanelEnVivo | null>(null);
  protected readonly estado = signal<number | null>(null);
  protected readonly refrescos = signal(0);

  constructor() {
    timer(0, CADA_MS)
      .pipe(
        // switchMap: si una respuesta tarda mas de 5 s, se descarta y vale la siguiente.
        switchMap(() =>
          this.vidalstore.panelEnVivo().pipe(
            // Sin catchError, el primer error cortaria el reloj para siempre.
            catchError((e: HttpErrorResponse) => {
              this.estado.set(e.status);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((datos) => {
        this.refrescos.update((n) => n + 1);
        if (datos) {
          this.datos.set(datos);
          this.estado.set(200);
        }
      });
  }

  protected clp(monto: number): string {
    return FORMATO_CLP.format(monto);
  }

  // Los ultimos 10 minutos, el mas reciente arriba.
  protected ultimosMinutos() {
    return (this.datos()?.porMinuto ?? []).slice(-10).reverse();
  }

  protected juegosConMasPartidas() {
    return (this.datos()?.porJuego ?? []).slice(0, 8);
  }
}
