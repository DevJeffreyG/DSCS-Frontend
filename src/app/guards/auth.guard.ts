import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../shared/enums/user-role';
import { LoggeduserService } from '../shared/services/loggeduser.service';

export const authGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);

  const isLogged = localStorage.getItem('auth') === 'true';

  if (!isLogged) {
    router.navigate(['/signin']);
    return false;
  }

  if (LoggeduserService.getUser()?.rol === UserRole.Operator && state.url === '/config') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};