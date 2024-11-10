import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';

@ApiTags("Employee")
@UseGuards(CompanyGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto, @CompanyContext() company: Prisma.CompanyCreateInput) {
    createEmployeeDto.companyId = company.id;
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Query() params: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput
  ) {
    return this.employeeService.findAll(params, company);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
