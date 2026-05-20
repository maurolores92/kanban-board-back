import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly') @Auth()
  getMonthlyReport(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @GetUser() user: any,
  ) {
    return this.reportsService.getMonthlyReport(query, user);
  }

  @Get('yearly') @Auth()
  getAnnualReport(
    @Query(new ValidationPipe({ transform: true })) query: ReportQueryDto,
    @GetUser() user: any,
  ) {
    return this.reportsService.getAnnualReport(query, user);
  }
}
