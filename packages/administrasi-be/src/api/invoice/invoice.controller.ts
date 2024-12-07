import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  CreateInvoiceAddtionalDto,
  CreateInvoiceDto,
} from './dto/create-invoice.dto';
import {
  UpdateInvoiceAdditonalDto,
  UpdateInvoiceDto,
} from './dto/update-invoice.dto';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApproveInvoiceDto } from './dto/approve.dto';

@ApiTags('Invoice')
@UseGuards(CompanyGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CompanyContext() company: Prisma.CompanyCreateInput) {
    createInvoiceDto.companyId = company.id;
    return this.invoiceService.create(createInvoiceDto);
  }

  @Post('additional')
  createAdditional(@Body() createInvoiceDto: CreateInvoiceAddtionalDto, @CompanyContext() company: Prisma.CompanyCreateInput) {
    createInvoiceDto.companyId = company.id;
    return this.invoiceService.createAdditional(createInvoiceDto);
  }

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput
  ) {
    return this.invoiceService.findAll(
      query,
      company
    );
  }

  @Get('all')
  getAllInvoice(@CompanyContext() company: Prisma.CompanyCreateInput) {
    return this.invoiceService.getAllInvoice(company);
  }


  @Post('adjusment')
  approve(@Body() approveDto: ApproveInvoiceDto) {
    return this.invoiceService.approve(approveDto);
  }

  @Get('/statuses/:status')
  getByStatus(@Param('status') status: Prisma.EnumInvoiceStatusFilter | InvoiceStatus, @CompanyContext() company: Prisma.CompanyCreateInput) {
    return this.invoiceService.getByStatus(status, company);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Patch('additional/:id')
  updateAdditional(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceAdditonalDto) {
    return this.invoiceService.updateAdditional(id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  @Delete('activities/:id')
  deleteActivities(@Param('id') id: string) {
    return this.invoiceService.deleteActivity(id);
  }

  @Delete('additional/:id')
  deleteAdditional(@Param('id') id: string) {
    return this.invoiceService.deleteAdditional(id);
  }
}
