import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { ResponseHelper } from 'libs/helpers/response.helper';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async create(createActivity: Prisma.ActivityCreateInput) {
    return await this.prismaService.activity.create({
      data: createActivity
    })
  }

  async findAll(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput
  ) {
    return paginate<Prisma.ActivityFindManyArgs>(this.prismaService.activity, new StatementScopeHelper<Prisma.ActivityFindManyArgs>({ params: query }, ['name']), {
      where: {
        companyId: company.id,
        ...query.where
      }
    })
  }

  async getAll(
    params: PaginationDto,
  ) {
    const activities = await this.prismaService.activity.findMany({
      where: {
        ...params.where
      }
    })

    return new ResponseHelper({ data: activities })
  }

  async findOne(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id
      }
    })

    if (!activity) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    return activity
  }

  async update(id: string, updateActivityDto: Prisma.ActivityUpdateInput) {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id
      }
    })

    if (!activity) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const activityUpdate = await this.prismaService.activity.update({
      where: {
        id
      },
      data: updateActivityDto
    })
    return activityUpdate;
  }

  async remove(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id
      }
    })

    if (!activity) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const deleteActivity = await this.prismaService.activity.delete({
      where: {
        id
      }
    })
    return deleteActivity;
  }
}
