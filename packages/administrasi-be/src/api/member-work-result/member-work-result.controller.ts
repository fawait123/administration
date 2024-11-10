import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MemberWorkResultService } from './member-work-result.service';
import { CreateMemberWorkResultDto } from './dto/create-member-work-result.dto';
import { UpdateMemberWorkResultDto } from './dto/update-member-work-result.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('Member Work Result')
@UseGuards(CompanyGuard)
@Controller('member-work-result')
export class MemberWorkResultController {
  constructor(private readonly memberWorkResultService: MemberWorkResultService) { }

  @Post()
  create(@Body() createMemberWorkResultDto: CreateMemberWorkResultDto, @CompanyContext() company: Prisma.CompanyCreateInput) {
    createMemberWorkResultDto.companyId = company.id
    return this.memberWorkResultService.create(createMemberWorkResultDto);
  }

  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput
  ) {
    return this.memberWorkResultService.findAll(query, company);
  }

  @Get('activities')
  getActivities() {
    return this.memberWorkResultService.getActivities()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberWorkResultService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberWorkResultDto: UpdateMemberWorkResultDto, @CompanyContext() company: Prisma.CompanyCreateInput) {
    updateMemberWorkResultDto.companyId = company.id
    return this.memberWorkResultService.update(id, updateMemberWorkResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberWorkResultService.remove(id);
  }

  @Delete('activity/:id')
  deleteActivity(@Param('id') id: string) {
    return this.memberWorkResultService.deleteActivity(id)
  }
}
