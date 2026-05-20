import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Users } from '../../users/users.model';
import { Category } from '../categories/category.model';

@Table({ timestamps: true })
export class Transaction extends Model {
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
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @Column({ type: DataType.ENUM('income', 'expense'), allowNull: false })
  declare type: 'income' | 'expense';

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: false })
  declare amount: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare date: Date;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdByAdminId: number;

  @BelongsTo(() => Users, 'createdByAdminId')
  declare createdByAdmin: Users;
}
