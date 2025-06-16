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
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { CompanyGuard } from 'libs/guard/company-guard/company.guard';
import { CompanyContext } from 'libs/decorators/company.decorator';
import { Prisma } from '@prisma/client';

@ApiTags('Activity')
@UseGuards(CompanyGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    createActivityDto.companyId = company.id;
    return this.activityService.create(createActivityDto);
  }

  @Get()
  findAll(
    @Query() params: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    return this.activityService.findAll(params, company);
  }

  @Get('all')
  getAll(
    @Query() params: PaginationDto,
    @CompanyContext() company: Prisma.CompanyCreateInput,
  ) {
    return this.activityService.getAll(params, company);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }
}
