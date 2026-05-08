import { Component } from '@angular/core';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { TableDropdownComponent } from '../common/table-dropdown/table-dropdown.component';
import { InputFieldComponent } from '../form/input/input-field.component';
import { LabelComponent } from '../form/label/label.component';
import { ButtonComponent } from '../ui/button/button.component';
import { ModalComponent } from '../ui/modal/modal.component';
import { Option, SelectComponent } from '../form/select/select.component';
import { UserRole } from '../../enums/user-role';

@Component({
  selector: 'app-user-crud',
  imports: [
    CommonModule,
    TableDropdownComponent,
    ModalComponent,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent
  ],
  templateUrl: './user-crud.component.html',
  styleUrl: './user-crud.component.css',
})
export class UserCrudComponent {
  users: User[] = [];
  userRoles = UserRole; // Expose enum to template

  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userRole: UserRole | null = null; // Default role for new users

  roleOptions: Option[] = [
    { value: UserRole.Admin, label: 'Admin' },
    { value: UserRole.Operator, label: 'Operator' },
    { value: UserRole.User, label: 'User' }
  ];

  showPassword = false;
  public addUserIsOpen = false;

  constructor(private userService: UserService) { }

  async ngOnInit() {
    console.log(this.roleOptions, this.userRole)
    // Fetch users from the service (replace with actual service call)
    this.users = await this.userService.getUsers();
  }

  getRole(role: number): string {
    return UserRole[role as unknown as keyof typeof UserRole].toString() || 'Unknown';
  }

  addUserModal() {
    this.addUserIsOpen = true;
  }

  closeAddUser() {
    this.addUserIsOpen = false;
  }

  handleAddUser() {
    this.userService.addUser({
      id_usuario: Date.now(), // Temporary ID, replace with actual ID from backend
      nombre: this.userName,
      correo: this.userEmail,
      contraseña: this.userPassword,
      rol: this.userRole || UserRole.User
    })
    .then(async () => {
      // Refresh user list after adding new user
      this.users = await this.userService.getUsers();
    })
    .catch(error => {
      console.error('Error adding user:', error);
    });

    this.closeAddUser();
  }

  handleRoleChange(value: any) {
    this.userRole = value;
    console.log('Selected role:', this.userRole);
  }

  editUser(user: User) {
    // Implement edit logic here
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    // Implement delete logic here
    console.log('Delete user:', user);
  }

}