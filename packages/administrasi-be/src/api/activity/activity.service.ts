import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { all, paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createActivity: CreateActivityDto) {
    const { childrens, ...data } = createActivity

    const duplicate = await this.prismaService.activity.findFirst({
      where: {
        name: data.name.trim()
      }
    })

    if (duplicate) {
      throw new BadRequestException(`Data ${data.name} sudah ditambahkan`)
    }

    const activity = await this.prismaService.$transaction(async (transaction) => {
      const parent = await this.prismaService.activity.create({
        data: data,
      })

      const dataChildrens = []
      if (childrens.length > 0) {
        await Promise.all(
          childrens.map(async (child) => {
            const childActivity = await this.prismaService.activityGroup.create({
              data: {
                parentId: parent.id,
                childId: child
              },
            });
            dataChildrens.push(childActivity);
          }),
        )
      }

      return { parent, dataChildrens }
    });

    return activity
  }

  async findAll(query: PaginationDto, company: Prisma.CompanyCreateInput) {
    if (query.all) {
      return all<Prisma.ActivityFindManyArgs>(
        this.prismaService.activity,
        new StatementScopeHelper<Prisma.ActivityFindManyArgs>({ params: query }, [
          'name',
        ]),
        {
          where: {
            companyId: company.id,
            ...query.where,
          },
        },
      );
    }


    return paginate<Prisma.ActivityFindManyArgs>(
      this.prismaService.activity,
      new StatementScopeHelper<Prisma.ActivityFindManyArgs>({ params: query }, [
        'name',
      ]),
      {
        where: {
          companyId: company.id,
          ...query.where,
        },
        include: {
          childrens: true
        }
      },
    );
  }

  async getAll(params: PaginationDto) {
    const activities = await this.prismaService.activity.findMany({
      where: {
        ...params.where,
      },
    });

    return new ResponseHelper({ data: activities });
  }

  async findOne(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id,
      },
    });

    if (!activity) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    const { childrens, ...data } = updateActivityDto

    const activity = await this.prismaService.$transaction(async (transaction) => {
      const parent = await transaction.activity.update({
        data: data,
        where: {
          id
        }
      })

      await transaction.activityGroup.deleteMany({
        where: {
          parentId: parent.id,
        }
      })
      const dataChildrens = []
      if (childrens.length > 0) {
        await Promise.all(
          childrens.map(async (child) => {
            const childActivity = await transaction.activityGroup.create({
              data: {
                parentId: parent.id,
                childId: child
              },
            });
            dataChildrens.push(childActivity);
          }),
        )
      }

      return { parent, dataChildrens }
    })

    return activity;
  }

  async remove(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id,
      },
    });

    if (!activity) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const deleteActivity = this.prismaService.$transaction(async (transaction) => {
      await transaction.activityGroup.deleteMany({
        where: {
          parentId: activity.id
        }
      })
      await transaction.activity.delete({
        where: {
          id,
        },
      })
    });
    return deleteActivity;
  }
}
