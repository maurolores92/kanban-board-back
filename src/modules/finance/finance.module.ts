import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [CategoriesModule, TransactionsModule, BudgetsModule, ReportsModule],
  exports: [CategoriesModule, TransactionsModule, BudgetsModule, ReportsModule],
})
export class FinanceModule {}
