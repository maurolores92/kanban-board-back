import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, BelongsToMany } from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { RolePermission } from '../role/role-permission/role-permission.model';

@Table({ timestamps: true })
export class Permission extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare slug: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare description: string;

  @Column({ type: DataType.ENUM('page', 'component', 'action'), defaultValue: 'page' })
  declare type: 'page' | 'component' | 'action';

  @Column({ type: DataType.STRING, allowNull: true })
  declare resource: string; // Ruta o identificador del recurso

  @BelongsToMany(() => Role, () => RolePermission)
  roles?: Role[];
}