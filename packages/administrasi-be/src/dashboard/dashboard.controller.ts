import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';

@UseGuards(CompanyGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('card')
  getCardData(@CompanyContext() company: Prisma.CompanyCreateInput) {
    return this.dashboardService.getCardData(company);
  }
}
