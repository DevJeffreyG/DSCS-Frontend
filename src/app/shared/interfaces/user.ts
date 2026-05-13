import { UserRole } from "../enums/user-role";

export interface User {
    id_usuario: number;
    nombre: string;
    correo: string;
    contraseña: string;
    rol: UserRole;
}

export interface UserPublic {
    id_usuario: number;
    nombre: string;
    correo: string;
    rol: UserRole;
}