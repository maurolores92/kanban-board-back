import { Controller, Get, Post, Body, Put, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoriesDto } from './dto/list-categories.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post() @Auth()
  create(
    @Body(new ValidationPipe({ transform: true })) createCategoryDto: CreateCategoryDto,
    @GetUser() user: any,
  ) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Get() @Auth()
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: ListCategoriesDto,
    @GetUser() user: any,
  ) {
    return this.categoriesService.findAll(user, query);
  }

  @Get(':id') @Auth()
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.categoriesService.findOne(+id, user);
  }

  @Put(':id') @Auth()
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: any,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto, user);
  }

  @Delete(':id') @Auth()
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.categoriesService.remove(+id, user);
  }
}
