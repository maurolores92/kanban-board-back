import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { Budget } from './budget.model';
import { Transaction } from '../transactions/transaction.model';
import { Category } from '../categories/category.model';
import { Users } from '../../users/users.model';

@Module({
  imports: [SequelizeModule.forFeature([Budget, Transaction, Category, Users])],
  providers: [BudgetsService],
  controllers: [BudgetsController],
  exports: [BudgetsService],
})
export class BudgetsModule {}
