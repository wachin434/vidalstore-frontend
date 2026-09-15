import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { signInWithRedirect } from 'aws-amplify/auth';
import { Sesion } from './auth/sesion';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly sesion = inject(Sesion);

  protected async entrar() {
    await signInWithRedirect();
  }

  protected async salir() {
    await this.sesion.salir();
  }
}