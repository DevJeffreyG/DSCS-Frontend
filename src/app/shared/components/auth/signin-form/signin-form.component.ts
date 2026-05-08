import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-signin-form',
  standalone: true,

  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
  ],

  templateUrl: './signin-form.component.html',
})

export class SigninFormComponent {

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  loading = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSignIn() {

    this.loading = true;

    try {

      const user = await this.userService.login(
        this.email,
        this.password
      );

      if (user) {

        // guardar sesión
        localStorage.setItem('auth', 'true');

        // guardar usuario completo
        localStorage.setItem(
          'user',
          JSON.stringify(user)
        );

        // guardar rol
        localStorage.setItem(
          'role',
          String(user.rol)
        );

        // redirección
        this.router.navigate(['/dashboard']);

      } else {

        alert('Correo o contraseña incorrectos');

      }

    } catch (error) {

      console.error(error);
      alert('Error al iniciar sesión');

    }

    this.loading = false;
  }
}