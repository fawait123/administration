import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';

@UseGuards(CompanyGuard)
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }
    @Get('current')
    getCurrentNotification(@CompanyContext() company: Prisma.CompanyCreateInput) {
        return this.notificationService.getCurrentNotification(company)
    }
}
