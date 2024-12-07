import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { WorksheetService } from './worksheet.service';
import { Response } from 'express';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';
import { NotificationFilter } from '../notification/dto/push.dto';

@Controller('worksheet')
export class WorksheetController {
  constructor(private readonly worksheetService: WorksheetService) { }

  @Get('member-work-result/:id')
  memberWorkResult(@Res() res: Response, @Param('id') id: string) {
    return this.worksheetService.exportMemberWorkResult(res, id);
  }

  @Get('invoice-activity/:id')
  invoiceActivity(@Res() res: Response, @Param('id') id: string) {
    return this.worksheetService.exportInvoiceActivity(res, id);
  }

  @Get('invoice-additional/:id')
  invoiceAdditional(@Res() res: Response, @Param('id') id: string) {
    return this.worksheetService.exportInvoiceAdditional(res, id);
  }

  @UseGuards(CompanyGuard)
  @Get('notification')
  notification(
    @CompanyContext() company: Prisma.CompanyCreateInput,
    @Res() res: Response,
    @Query() query: NotificationFilter
  ) {
    return this.worksheetService.exportNotification(res, company, query);
  }
}
