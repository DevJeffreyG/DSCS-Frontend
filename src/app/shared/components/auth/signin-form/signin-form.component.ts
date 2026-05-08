import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {

    if (this.email === 'admin@mail.com' &&
        this.password === '1234') {

      localStorage.setItem('auth', 'true');

      this.router.navigate(['/dashboard']);

    } else {
      alert('Credenciales incorrectas');
    }
  }
}