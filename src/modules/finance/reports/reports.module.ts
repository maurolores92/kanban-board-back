import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Transaction } from '../transactions/transaction.model';
import { Budget } from '../budgets/budget.model';
import { Users } from '../../users/users.model';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Budget, Users])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
