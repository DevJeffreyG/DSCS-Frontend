import { ChangelogType } from "../enums/changelog-type";

export interface Changelog {
    id: number;
    descripcion: string;
    tipo: ChangelogType;
    old: any;
    new: any;
    fecha: Date;
    id_usuario: number;
}
