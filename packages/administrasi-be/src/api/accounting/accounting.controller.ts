import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';

@UseGuards(CompanyGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) { }

  @Post()
  create(
    @Body() createAccountingDto: CreateAccountingDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    return this.accountingService.create(createAccountingDto);
  }

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    return this.accountingService.findAll(query, company);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountingDto: UpdateAccountingDto,
  ) {
    return this.accountingService.update(id, updateAccountingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountingService.remove(id);
  }
}
