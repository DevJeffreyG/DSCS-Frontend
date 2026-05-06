import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const isLogged = localStorage.getItem('auth') === 'true';

  if (!isLogged) {
    router.navigate(['/signin']);
    return false;
  }

  return true;
};