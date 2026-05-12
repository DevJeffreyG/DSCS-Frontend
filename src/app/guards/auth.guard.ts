import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserRole } from '../shared/enums/user-role';
import { LoggeduserService } from '../shared/services/loggeduser.service';
import { AuthService } from '../shared/services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLogged = localStorage.getItem('auth');

  if (!isLogged) {
    router.navigate(['/signin']);
    return false;
  } else {
    return authService.validateToken(isLogged).then((isValid) => {
      if (!isValid) {
        console.error('❌ Token inválido');
        LoggeduserService.signOut();
        router.navigate(['/signin']);
        return false;
      } else {
        // token válido, continuar
        if (LoggeduserService.getUser()?.rol === UserRole.Operator && state.url === '/config') {
          router.navigate(['/dashboard']);
          return false;
        }

        return true;
      }
    });
  }

};