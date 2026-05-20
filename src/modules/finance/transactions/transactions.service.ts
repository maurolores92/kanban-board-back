import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from './transaction.model';
import { Users } from '../../users/users.model';
import { Category } from '../categories/category.model';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Users) private readonly usersModel: typeof Users,
  ) {}

  private async ensureUserAllowed(userId: number, currentUser: any): Promise<void> {
    if (!currentUser.isAdmin && userId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para crear o ver transacciones de otro usuario');
    }

    const user = await this.usersModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentUser.isAdmin && user.id !== currentUser.id && user.createdByAdminId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para gestionar las transacciones de este usuario');
    }
  }

  private async canManageTransaction(transaction: Transaction, currentUser: any): Promise<boolean> {
    if (currentUser.isAdmin) {
      if (transaction.createdByAdminId === currentUser.id) {
        return true;
      }
      const user = await this.usersModel.findByPk(transaction.userId);
      return user?.createdByAdminId === currentUser.id || transaction.userId === currentUser.id;
    }

    return transaction.userId === currentUser.id;
  }

  async create(createTransactionDto: CreateTransactionDto, currentUser: any): Promise<Transaction> {
    const targetUserId = createTransactionDto.userId ?? currentUser.id;

    if (createTransactionDto.userId && !currentUser.isAdmin) {
      throw new ForbiddenException('Solo admins pueden crear transacciones para otros usuarios');
    }

    await this.ensureUserAllowed(targetUserId, currentUser);

    const category = await this.categoryModel.findByPk(createTransactionDto.categoryId);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const createdByAdminId = currentUser.isAdmin && targetUserId !== currentUser.id ? currentUser.id : null;

    return this.transactionModel.create({
      userId: targetUserId,
      categoryId: createTransactionDto.categoryId,
      type: createTransactionDto.type,
      amount: createTransactionDto.amount,
      description: createTransactionDto.description,
      date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
      createdByAdminId,
    } as any);
  }

  async findAll(query: QueryTransactionDto, currentUser: any): Promise<Transaction[]> {
    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.fromDate || query.toDate) {
      where.date = {};
      if (query.fromDate) {
        where.date[Op.gte] = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.date[Op.lte] = new Date(query.toDate);
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

    return this.transactionModel.findAll({
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
      order: [['date', 'DESC']],
    });
  }

  async findOne(id: number, currentUser: any): Promise<Transaction> {
    const transaction = await this.transactionModel.findByPk(id, {
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

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (!(await this.canManageTransaction(transaction, currentUser))) {
      throw new ForbiddenException('No tienes permiso para ver esta transacción');
    }

    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto, currentUser: any): Promise<Transaction> {
    const transaction = await this.findOne(id, currentUser);

    if (updateTransactionDto.userId && !currentUser.isAdmin) {
      throw new ForbiddenException('Solo admins pueden cambiar el usuario de la transacción');
    }

    if (updateTransactionDto.userId) {
      await this.ensureUserAllowed(updateTransactionDto.userId, currentUser);
      transaction.userId = updateTransactionDto.userId;
      transaction.createdByAdminId = currentUser.isAdmin && updateTransactionDto.userId !== currentUser.id ? currentUser.id : transaction.createdByAdminId;
    }

    if (updateTransactionDto.categoryId) {
      const category = await this.categoryModel.findByPk(updateTransactionDto.categoryId);
      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    await transaction.update({
      categoryId: updateTransactionDto.categoryId ?? transaction.categoryId,
      type: updateTransactionDto.type ?? transaction.type,
      amount: updateTransactionDto.amount ?? transaction.amount,
      description: updateTransactionDto.description ?? transaction.description,
      date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : transaction.date,
      userId: transaction.userId,
      createdByAdminId: transaction.createdByAdminId,
    } as any);

    return transaction;
  }

  async remove(id: number, currentUser: any): Promise<void> {
    const transaction = await this.findOne(id, currentUser);
    await transaction.destroy();
  }
}
