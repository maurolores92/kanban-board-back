import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './transaction.model';
import { Category } from '../categories/category.model';
import { Users } from '../../users/users.model';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Category, Users])],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
