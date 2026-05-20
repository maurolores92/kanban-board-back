import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Users } from '../../users/users.model';
import { Category } from '../categories/category.model';

@Table({ timestamps: true })
export class Budget extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => Users)
  declare user: Users;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare amount: number;

  @Column({ type: DataType.ENUM('monthly', 'yearly'), allowNull: false })
  declare period: 'monthly' | 'yearly';

  @Column({ type: DataType.DATE, allowNull: false })
  declare startDate: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare endDate: Date;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdByAdminId: number;

  @BelongsTo(() => Users, 'createdByAdminId')
  declare createdByAdmin: Users;
}
