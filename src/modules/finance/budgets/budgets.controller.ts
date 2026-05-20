import { Controller, Get, Post, Body, Put, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post() @Auth()
  create(
    @Body(new ValidationPipe({ transform: true })) createBudgetDto: CreateBudgetDto,
    @GetUser() user: any,
  ) {
    return this.budgetsService.create(createBudgetDto, user);
  }

  @Get() @Auth()
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryBudgetDto,
    @GetUser() user: any,
  ) {
    return this.budgetsService.findAll(query, user);
  }

  @Get(':id') @Auth()
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.budgetsService.findOne(+id, user);
  }

  @Get(':id/progress') @Auth()
  getProgress(@Param('id') id: string, @GetUser() user: any) {
    return this.budgetsService.getProgress(+id, user);
  }

  @Put(':id') @Auth()
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateBudgetDto: UpdateBudgetDto,
    @GetUser() user: any,
  ) {
    return this.budgetsService.update(+id, updateBudgetDto, user);
  }

  @Delete(':id') @Auth()
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.budgetsService.remove(+id, user);
  }
}
