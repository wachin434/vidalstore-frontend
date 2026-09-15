import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

@Component({
  selector: 'app-callback',
  imports: [RouterLink],
  templateUrl: './callback.html',
})
export class Callback {
  private readonly router = inject(Router);

  protected readonly conCodigo = signal(
    new URLSearchParams(window.location.search).has('code'),
  );

  constructor() {
    Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        this.router.navigateByUrl('/catalogo');
      }
    });
    this.siYaHaySesion();
  }

  private async siYaHaySesion() {
    const { tokens } = await fetchAuthSession();
    if (tokens?.accessToken) this.router.navigateByUrl('/catalogo');
  }
}import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

@Component({
  selector: 'app-callback',
  imports: [RouterLink],
  templateUrl: './callback.html',
})
export class Callback {
  private readonly router = inject(Router);

  protected readonly conCodigo = signal(
    new URLSearchParams(window.location.search).has('code'),
  );

  constructor() {
    Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        this.router.navigateByUrl('/catalogo');
      }
    });
    this.siYaHaySesion();
  }

  private async siYaHaySesion() {
    const { tokens } = await fetchAuthSession();
    if (tokens?.accessToken) this.router.navigateByUrl('/catalogo');
  }
}