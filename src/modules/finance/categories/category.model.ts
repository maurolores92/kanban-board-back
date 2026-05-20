import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Users } from '../../users/users.model';
import { Transaction } from '../transactions/transaction.model';
import { Budget } from '../budgets/budget.model';

@Table({ timestamps: true })
export class Category extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.ENUM('income', 'expense'), allowNull: false })
  declare type: 'income' | 'expense';

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare createdByUserId: number;

  @BelongsTo(() => Users, 'createdByUserId')
  declare createdByUser: Users;

  @HasMany(() => Transaction)
  declare transactions: Transaction[];

  @HasMany(() => Budget)
  declare budgets: Budget[];
}
