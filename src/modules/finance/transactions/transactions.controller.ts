import { Controller, Get, Post, Body, Put, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post() @Auth()
  create(
    @Body(new ValidationPipe({ transform: true })) createTransactionDto: CreateTransactionDto,
    @GetUser() user: any,
  ) {
    return this.transactionsService.create(createTransactionDto, user);
  }

  @Get() @Auth()
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryTransactionDto,
    @GetUser() user: any,
  ) {
    return this.transactionsService.findAll(query, user);
  }

  @Get(':id') @Auth()
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.transactionsService.findOne(+id, user);
  }

  @Put(':id') @Auth()
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateTransactionDto: UpdateTransactionDto,
    @GetUser() user: any,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto, user);
  }

  @Delete(':id') @Auth()
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.transactionsService.remove(+id, user);
  }
}
