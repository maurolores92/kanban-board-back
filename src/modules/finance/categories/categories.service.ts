import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Category } from './category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Users } from '../../users/users.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Users) private readonly usersModel: typeof Users,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, currentUser: any): Promise<Category> {
    const user = await this.usersModel.findByPk(currentUser.id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.categoryModel.create({
      ...createCategoryDto,
      createdByUserId: user.id,
    } as any);
  }

  async findAll(currentUser: any, filter?: { type?: 'income' | 'expense' }): Promise<Category[]> {
    const where: any = {
      [Op.or]: [
        { createdByUserId: null },
        { createdByUserId: currentUser.id },
      ],
    };

    if (filter?.type) {
      where.type = filter.type;
    }

    return this.categoryModel.findAll({
      where,
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number, currentUser: any): Promise<Category> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (category.createdByUserId && category.createdByUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permisos para ver esta categoría');
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, currentUser: any): Promise<Category> {
    const category = await this.findOne(id, currentUser);
    if (!category.createdByUserId) {
      throw new ForbiddenException('No puedes modificar categorías globales');
    }

    await category.update(updateCategoryDto as any);
    return category;
  }

  async remove(id: number, currentUser: any): Promise<void> {
    const category = await this.findOne(id, currentUser);
    if (!category.createdByUserId) {
      throw new ForbiddenException('No puedes eliminar categorías globales');
    }

    await category.destroy();
  }
}
