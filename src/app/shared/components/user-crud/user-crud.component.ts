import { Component } from '@angular/core';
import { User, UserPublic } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { TableDropdownComponent } from '../common/table-dropdown/table-dropdown.component';
import { InputFieldComponent } from '../form/input/input-field.component';
import { LabelComponent } from '../form/label/label.component';
import { ButtonComponent } from '../ui/button/button.component';
import { ModalComponent } from '../ui/modal/modal.component';
import { Option, SelectComponent } from '../form/select/select.component';
import { UserRole } from '../../enums/user-role';
import { LoggeduserService } from '../../services/loggeduser.service';
import { ChangelogService } from '../../services/changelog.service';

@Component({
  selector: 'app-user-crud',
  standalone: true,
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
  users: UserPublic[] = [];

  editingUser: UserPublic | null = null;

  userRoles = UserRole;

  userName: string = '';
  userEmail: string = '';
  userPassword: string = '';
  userRole: UserRole | null = null;

  roleOptions: Option[] = [
    {
      value: UserRole.Admin,
      label: 'Admin'
    },
    {
      value: UserRole.Operator,
      label: 'Operator'
    }
  ];

  showPassword = false;
  addUserIsOpen = false;

  constructor(
    private userService: UserService,
    private changelogService: ChangelogService) { }

  async ngOnInit() {
    this.users = await this.userService.getUsers();
  }

  handleRoleChange(value: any) {
    this.userRole = value;
  }

  // ADD / UPDATE USER
  async handleAddUser() {
    if (this.editingUser) {
      const updatedUser: User = {
        ...this.editingUser,
        nombre: this.userName,
        correo: this.userEmail,
        contraseña: this.userPassword,
        rol: this.userRole || UserRole.Operator
      };

      await this.userService.updateUser(
        this.editingUser.id_usuario,
        updatedUser
      );

      // REFRESH
      this.changelogService.syncChangelogs().then(() => { console.log("Synced changelogs "); }).catch((err) => { console.error("Error syncing changelogs", err); });
      this.users = await this.userService.getUsers();
      this.editingUser = null;
    } else {
      const newUser: User = {
        id_usuario: Date.now(),
        nombre: this.userName,
        correo: this.userEmail,
        contraseña: this.userPassword,
        rol: this.userRole || UserRole.Operator
      };

      await this.userService.addUser(newUser);
      this.users = await this.userService.getUsers();
    }

    this.userName = '';
    this.userEmail = '';
    this.userPassword = '';
    this.userRole = UserRole.Operator;

    this.closeAddUserModal();
  }

  async deleteUser(user: UserPublic) {
    await this.userService.deleteUser(user.id_usuario);

    this.changelogService.syncChangelogs().then(() => { console.log("Synced changelogs "); }).catch((err) => { console.error("Error syncing changelogs", err); });
    this.users = await this.userService.getUsers();
  }

  startEditUser(user: UserPublic) {
    this.editingUser = { ...user };
    this.userName = user.nombre;
    this.userEmail = user.correo;
    this.userRole = user.rol;

    this.addUserIsOpen = true;
  }

  startUserModal() {
    this.editingUser = null;
    this.userName = '';
    this.userEmail = '';
    this.userPassword = '';
    this.userRole = UserRole.Operator;

    this.addUserIsOpen = true;
  }

  closeAddUserModal() {
    this.addUserIsOpen = false;
  }

  isSameUser(user: UserPublic): boolean {
    const loggedUser = LoggeduserService.getUser();
    return loggedUser.id_usuario === user.id_usuario;
  }

  getRole(role: number): string {
    switch (role) {
      case UserRole.Admin:
        return 'Admin';
      case UserRole.Operator:
        return 'Operator';
      default:
        return 'Unknown';
    }
  }
}