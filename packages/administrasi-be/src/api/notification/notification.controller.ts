import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { NotificationFilter } from './dto/push.dto';

@UseGuards(CompanyGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }
  @Get('current')
  getCurrentNotification(
    @Query() params: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    return this.notificationService.getCurrentNotification(params, company);
  }
}
