import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from '../transactions/transaction.model';
import { Budget } from '../budgets/budget.model';
import { Users } from '../../users/users.model';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(Budget) private readonly budgetModel: typeof Budget,
    @InjectModel(Users) private readonly usersModel: typeof Users,
  ) {}

  private async ensureUserAllowed(userId: number, currentUser: any): Promise<void> {
    if (!currentUser.isAdmin && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para ver reportes de otro usuario');
    }

    const user = await this.usersModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentUser.isAdmin && user.id !== currentUser.id && user.createdByAdminId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para ver reportes de este usuario');
    }
  }

  private getMonthRange(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private getYearRange(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private async getBudgetTotalForRange(userId: number, startDate: Date, endDate: Date): Promise<number> {
    const budgets = await this.budgetModel.findAll({
      where: {
        userId,
        [Op.or]: [
          {
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: startDate },
          },
        ],
      },
    });

    return budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  }

  async getMonthlyReport(query: ReportQueryDto, currentUser: any) {
    const today = new Date();
    const year = query.year ?? today.getFullYear();
    const month = query.month ?? today.getMonth() + 1;

    const userId = query.userId ?? currentUser.id;
    await this.ensureUserAllowed(userId, currentUser);

    const { startDate, endDate } = this.getMonthRange(year, month);

    const expenseTotal = Number(
      (await this.transactionModel.sum('amount', {
        where: { userId, type: 'expense', date: { [Op.between]: [startDate, endDate] } },
      })) || 0,
    );

    const incomeTotal = Number(
      (await this.transactionModel.sum('amount', {
        where: { userId, type: 'income', date: { [Op.between]: [startDate, endDate] } },
      })) || 0,
    );

    const budgetTotal = await this.getBudgetTotalForRange(userId, startDate, endDate);
    const variance = budgetTotal - expenseTotal;

    return {
      period: 'monthly',
      year,
      month,
      userId,
      incomeTotal,
      expenseTotal,
      budgetTotal,
      variance,
      budgetCoverage: budgetTotal > 0 ? Math.min(100, (expenseTotal / budgetTotal) * 100) : 0,
      trend: {
        previousMonth: this.getMonthRange(year, month - 1),
      },
    };
  }

  async getAnnualReport(query: ReportQueryDto, currentUser: any) {
    const today = new Date();
    const year = query.year ?? today.getFullYear();
    const userId = query.userId ?? currentUser.id;

    await this.ensureUserAllowed(userId, currentUser);

    const { startDate, endDate } = this.getYearRange(year);

    const expenseTotal = Number(
      (await this.transactionModel.sum('amount', {
        where: { userId, type: 'expense', date: { [Op.between]: [startDate, endDate] } },
      })) || 0,
    );

    const incomeTotal = Number(
      (await this.transactionModel.sum('amount', {
        where: { userId, type: 'income', date: { [Op.between]: [startDate, endDate] } },
      })) || 0,
    );

    const budgetTotal = await this.getBudgetTotalForRange(userId, startDate, endDate);
    const monthlyTrend: Array<{ month: number; expense: number; budget: number }> = [];

    for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
      const range = this.getMonthRange(year, monthIndex);
      const monthExpense = Number(
        (await this.transactionModel.sum('amount', {
          where: { userId, type: 'expense', date: { [Op.between]: [range.startDate, range.endDate] } },
        })) || 0,
      );
      const monthBudget = await this.getBudgetTotalForRange(userId, range.startDate, range.endDate);
      monthlyTrend.push({ month: monthIndex, expense: monthExpense, budget: monthBudget });
    }

    return {
      period: 'yearly',
      year,
      userId,
      incomeTotal,
      expenseTotal,
      budgetTotal,
      variance: budgetTotal - expenseTotal,
      monthlyTrend,
    };
  }
}
