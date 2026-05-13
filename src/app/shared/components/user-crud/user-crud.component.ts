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
import { ChangelogService } from '../../services/changelog.service';
import { ChangelogType } from '../../enums/changelog-type';
import { LoggeduserService } from '../../services/loggeduser.service';

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

  // =====================================
  // USERS
  // =====================================
  users: UserPublic[] = [];

  // =====================================
  // EDITING USER
  // =====================================
  editingUser: UserPublic | null = null;

  // =====================================
  // ENUM
  // =====================================
  userRoles = UserRole;

  // =====================================
  // FORM
  // =====================================
  userName: string = '';

  userEmail: string = '';

  userPassword: string = '';

  userRole: UserRole | null = null;

  // =====================================
  // ROLE OPTIONS
  // =====================================
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

  // =====================================
  // UI
  // =====================================
  showPassword = false;

  addUserIsOpen = false;

  // =====================================
  // CONSTRUCTOR
  // =====================================
  constructor(
    private userService: UserService,
    private changelogService: ChangelogService
  ) {}

  // =====================================
  // INIT
  // =====================================
  async ngOnInit() {

    this.users = await this.userService.getUsers();
    console.log("!!!!!!!!!!", this.users);

  }

  // =====================================
  // GET ROLE
  // =====================================
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

  // =====================================
  // OPEN MODAL
  // =====================================
  addUserModal() {

    // LIMPIAR
    this.editingUser = null;

    this.userName = '';

    this.userEmail = '';

    this.userPassword = '';

    this.userRole = UserRole.Operator;

    // OPEN
    this.addUserIsOpen = true;

  }

  // =====================================
  // CLOSE MODAL
  // =====================================
  closeAddUser() {

    this.addUserIsOpen = false;

  }

  // =====================================
  // HANDLE ROLE CHANGE
  // =====================================
  handleRoleChange(value: any) {

    this.userRole = value;

  }

  // =====================================
  // ADD / UPDATE USER
  // =====================================
  async handleAddUser() {

    // =========================
    // EDIT USER
    // =========================
    if (this.editingUser) {

      const updatedUser: User = {

        ...this.editingUser,

        nombre: this.userName,

        correo: this.userEmail,

        contraseña: this.userPassword,

        rol: this.userRole || UserRole.Operator

      };

      // UPDATE SERVICE
      await this.userService.updateUser(
        this.editingUser.id_usuario,
        updatedUser
      );

      // REFRESH
      this.users =
        await this.userService.getUsers();

      // CHANGELOG
      /* this.changelogService.newChangelog({

        id: Date.now(),

        descripcion:
          `Se editó el usuario "${updatedUser.nombre}"`,

        tipo:
          ChangelogType.USER_ROLE_CHANGED,

        old: this.editingUser,

        new: updatedUser,

        fecha: new Date(),

        id_usuario:
          LoggeduserService.getUser().id_usuario

      }); */

      // RESET
      this.editingUser = null;

    }

    // =========================
    // NEW USER
    // =========================
    else {

      const newUser: User = {

        id_usuario: Date.now(),

        nombre: this.userName,

        correo: this.userEmail,

        contraseña: this.userPassword,

        rol: this.userRole || UserRole.Operator

      };

      // SAVE
      await this.userService.addUser(
        newUser
      );

      // REFRESH
      this.users =
        await this.userService.getUsers();

      // CHANGELOG
      /* this.changelogService.newChangelog({

        id: Date.now(),

        descripcion:
          `Se agregó el usuario "${newUser.nombre}"`,

        tipo:
          ChangelogType.NEW_USER,

        old: undefined,

        new: newUser,

        fecha: new Date(),

        id_usuario:
          LoggeduserService.getUser().id_usuario

      }); */

    }

    // =====================================
    // CLEAR FORM
    // =====================================
    this.userName = '';

    this.userEmail = '';

    this.userPassword = '';

    this.userRole = UserRole.Operator;

    // =====================================
    // CLOSE
    // =====================================
    this.closeAddUser();

  }

  // =====================================
  // TODO: EDIT USER
  // =====================================
  editUser(user: UserPublic) {

    // SAVE USER
    this.editingUser = { ...user };

    // FILL FORM
    this.userName =
      user.nombre;

    this.userEmail =
      user.correo;

    this.userRole =
      user.rol;

    // OPEN MODAL
    this.addUserIsOpen = true;

  }

  // =====================================
  // TODO: DELETE USER
  // =====================================
  async deleteUser(user: UserPublic) {

    // DELETE
    await this.userService.deleteUser(
      user.id_usuario
    );

    // REFRESH
    this.users =
      await this.userService.getUsers();

    // CHANGELOG
    /* this.changelogService.newChangelog({

      id: Date.now(),

      descripcion:
        `Se eliminó el usuario "${user.nombre}"`,

      tipo:
        ChangelogType.USER_REMOVED,

      old: user,

      new: undefined,

      fecha: new Date(),

      id_usuario:
        LoggeduserService.getUser().id_usuario

    }); */

  }

}