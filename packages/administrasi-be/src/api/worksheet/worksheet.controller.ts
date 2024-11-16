import { Controller, Get, Param, Res } from '@nestjs/common';
import { WorksheetService } from './worksheet.service';
import { Response } from 'express';

@Controller('worksheet')
export class WorksheetController {
  constructor(private readonly worksheetService: WorksheetService) {}

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
}
