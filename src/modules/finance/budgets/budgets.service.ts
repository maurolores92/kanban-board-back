import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Budget } from './budget.model';
import { Users } from '../../users/users.model';
import { Category } from '../categories/category.model';
import { Transaction } from '../transactions/transaction.model';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget) private readonly budgetModel: typeof Budget,
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Users) private readonly usersModel: typeof Users,
  ) {}

  private async ensureUserAllowed(userId: number, currentUser: any): Promise<void> {
    if (!currentUser.isAdmin && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para gestionar budgets de otro usuario');
    }

    const user = await this.usersModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentUser.isAdmin && user.id !== currentUser.id && user.createdByAdminId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para gestionar los budgets de este usuario');
    }
  }

  private async canManageBudget(budget: Budget, currentUser: any): Promise<boolean> {
    if (currentUser.isAdmin) {
      if (budget.createdByAdminId === currentUser.id) {
        return true;
      }
      const user = await this.usersModel.findByPk(budget.userId);
      return user?.createdByAdminId === currentUser.id || budget.userId === currentUser.id;
    }

    return budget.userId === currentUser.id;
  }

  async create(createBudgetDto: CreateBudgetDto, currentUser: any): Promise<Budget> {
    const targetUserId = createBudgetDto.userId ?? currentUser.id;
    if (createBudgetDto.userId && !currentUser.isAdmin) {
      throw new ForbiddenException('Solo admins pueden crear budgets para otros usuarios');
    }

    await this.ensureUserAllowed(targetUserId, currentUser);

    if (createBudgetDto.categoryId) {
      const category = await this.categoryModel.findByPk(createBudgetDto.categoryId);
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    const createdByAdminId = currentUser.isAdmin && targetUserId !== currentUser.id ? currentUser.id : null;

    return this.budgetModel.create({
      userId: targetUserId,
      categoryId: createBudgetDto.categoryId ?? null,
      amount: createBudgetDto.amount,
      period: createBudgetDto.period,
      startDate: new Date(createBudgetDto.startDate),
      endDate: new Date(createBudgetDto.endDate),
      createdByAdminId,
    } as any);
  }

  async findAll(query: QueryBudgetDto, currentUser: any): Promise<Budget[]> {
    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.period) {
      where.period = query.period;
    }
    if (query.fromDate || query.toDate) {
      where.startDate = {};
      where.endDate = {};
      if (query.fromDate) {
        where.startDate[Op.gte] = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.endDate[Op.lte] = new Date(query.toDate);
      }
    }

    if (currentUser.isAdmin) {
      if (query.userId) {
        await this.ensureUserAllowed(query.userId, currentUser);
        where.userId = query.userId;
      } else {
        where[Op.or] = [
          { createdByAdminId: currentUser.id },
          { '$user.createdByAdminId$': currentUser.id },
        ];
      }
    } else {
      where.userId = currentUser.id;
    }

    return this.budgetModel.findAll({
      where,
      include: [
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'name', 'lastName', 'email', 'createdByAdminId'],
        },
        {
          model: Category,
          as: 'category',
        },
      ],
      order: [['startDate', 'DESC']],
    });
  }

  async findOne(id: number, currentUser: any): Promise<Budget> {
    const budget = await this.budgetModel.findByPk(id, {
      include: [
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'name', 'lastName', 'email', 'createdByAdminId'],
        },
        {
          model: Category,
          as: 'category',
        },
      ],
    });

    if (!budget) {
      throw new NotFoundException('Budget no encontrado');
    }

    if (!(await this.canManageBudget(budget, currentUser))) {
      throw new ForbiddenException('No tienes permiso para ver este budget');
    }

    return budget;
  }

  async update(id: number, updateBudgetDto: UpdateBudgetDto, currentUser: any): Promise<Budget> {
    const budget = await this.findOne(id, currentUser);

    if (updateBudgetDto.userId && !currentUser.isAdmin) {
      throw new ForbiddenException('Solo admins pueden cambiar el usuario del budget');
    }

    if (updateBudgetDto.userId) {
      await this.ensureUserAllowed(updateBudgetDto.userId, currentUser);
      budget.userId = updateBudgetDto.userId;
      budget.createdByAdminId = currentUser.isAdmin && updateBudgetDto.userId !== currentUser.id ? currentUser.id : budget.createdByAdminId;
    }

    if (updateBudgetDto.categoryId) {
      const category = await this.categoryModel.findByPk(updateBudgetDto.categoryId);
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    await budget.update({
      userId: budget.userId,
      categoryId: updateBudgetDto.categoryId ?? budget.categoryId,
      amount: updateBudgetDto.amount ?? budget.amount,
      period: updateBudgetDto.period ?? budget.period,
      startDate: updateBudgetDto.startDate ? new Date(updateBudgetDto.startDate) : budget.startDate,
      endDate: updateBudgetDto.endDate ? new Date(updateBudgetDto.endDate) : budget.endDate,
      createdByAdminId: budget.createdByAdminId,
    } as any);

    return budget;
  }

  async remove(id: number, currentUser: any): Promise<void> {
    const budget = await this.findOne(id, currentUser);
    await budget.destroy();
  }

  async getProgress(id: number, currentUser: any): Promise<{ budget: Budget; totalSpent: number; progress: number }> {
    const budget = await this.findOne(id, currentUser);

    const where: any = {
      userId: budget.userId,
      type: 'expense',
      date: {
        [Op.gte]: budget.startDate,
        [Op.lte]: budget.endDate,
      },
    };

    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const totalSpent = Number((await this.transactionModel.sum('amount', { where })) || 0);
    const progress = budget.amount > 0 ? Math.min(100, (totalSpent / Number(budget.amount)) * 100) : 0;

    return {
      budget,
      totalSpent,
      progress,
    };
  }
}
