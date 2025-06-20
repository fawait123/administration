import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMemberWorkResultDto } from './dto/create-member-work-result.dto';
import { UpdateMemberWorkResultDto } from './dto/update-member-work-result.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';

@Injectable()
export class MemberWorkResultService {
  constructor(private readonly primaService: PrismaService) {}

  async validateActivity(createMemberWorkResultDto: CreateMemberWorkResultDto) {
    const data: string[] = [];
    await Promise.all(
      createMemberWorkResultDto.activities.map(async (item) => {
        const duplicate = await this.primaService.$queryRaw<
          {
            plot: string;
            name: string;
          }[]
        >`SELECT mr.plot, a.name FROM administration.MemberWorkResultActivity mr
                left join Activity a on a.id = mr.activityId
                where mr.plot = ${item.plot} and mr.ActivityId = ${item.activityId} AND YEAR(mr.createdAt) >= YEAR(CURDATE()) - 4;`;

        if (duplicate.length > 0) {
          data.push(`<b>${duplicate[0].plot} ${duplicate[0].name}</b>`);
        }
      }),
    );

    if (data.length > 0) {
      throw new BadRequestException(
        `Data ${data.join(', ')} sudah ditambahkan`,
      );
    }
  }

  async create(createMemberWorkResultDto: CreateMemberWorkResultDto) {
    if (!createMemberWorkResultDto.companyId) {
      throw new BadRequestException(
        'Silahkan pilih perusahaan terlebih dahulu',
      );
    }

    await this.validateActivity(createMemberWorkResultDto);

    const check = await this.primaService.memberWorkResult.findFirst({
      where: {
        employeeId: createMemberWorkResultDto.employeeId,
        companyId: createMemberWorkResultDto.companyId,
        date: createMemberWorkResultDto.date,
      },
    });

    if (check) {
      throw new BadRequestException(
        'Data sudah ada recordnya, silahkan ubah jika ingin mengubah data',
      );
    }

    await this.validateActivity(createMemberWorkResultDto);

    const transaction = await this.primaService.$transaction(async (t) => {
      const memberWorkResult = await t.memberWorkResult.create({
        data: {
          companyId: createMemberWorkResultDto.companyId,
          date: createMemberWorkResultDto.date,
          employeeId: createMemberWorkResultDto.employeeId,
        },
      });

      const payloadMemberWorkResultActivity: Prisma.MemberWorkResultActivityCreateManyInput[] =
        createMemberWorkResultDto.activities.map((item, index) => {
          return {
            ActivityId: item.activityId,
            plot: item.plot,
            price: item.price,
            ql: item.ql,
            subTotal: item.subTotal,
            wide: item.wide,
            memberWorkResultId: memberWorkResult.id,
            ordered: index,
          };
        });

      const memberWorkResultActivity =
        await t.memberWorkResultActivity.createMany({
          data: payloadMemberWorkResultActivity,
        });

      const payloadMemberWorkResultBon: Prisma.MemberWorkResultBonCreateManyInput[] =
        createMemberWorkResultDto.bon.map((item) => {
          return {
            note: item.note,
            total: item.total,
            memberWorkResultId: memberWorkResult.id,
          };
        });

      const memberWorkResultBon = await t.memberWorkResultBon.createMany({
        data: payloadMemberWorkResultBon,
      });

      return {
        memberWorkResult,
        memberWorkResultActivity,
        memberWorkResultBon,
      };
    });

    return new ResponseHelper({ data: transaction });
  }

  findAll(query: PaginationDto, company: Prisma.CompanyCreateInput) {
    return paginate<Prisma.MemberWorkResultFindManyArgs>(
      this.primaService.memberWorkResult,
      new StatementScopeHelper<Prisma.MemberWorkResultFindManyArgs>(
        { params: query },
        ['date'],
      ),
      {
        include: {
          employee: true,
          company: true,
        },
        where: {
          companyId: company.id,
        },
        orderBy: {
          date: 'desc',
        },
      },
    );
  }

  async getActivities() {
    const activities =
      await this.primaService.memberWorkResultActivity.findMany({
        include: {
          memberWorkResult: {
            include: {
              employee: true,
            },
          },
          activity: true,
        },
      });

    return new ResponseHelper({ data: activities });
  }

  async findOne(id: string) {
    const memberWorkResult =
      await this.primaService.memberWorkResult.findUnique({
        where: {
          id,
        },
        include: {
          activities: {
            include: {
              activity: true,
            },
            orderBy: {
              ordered: 'asc',
            },
          },
          bon: true,
        },
      });

    const activities = await Promise.all(
      memberWorkResult.activities.map(async (item) => {
        const approve: { total: bigint }[] = await this.primaService.$queryRaw<
          { total: bigint }[]
        >`
          select count(*) total from (select ia.status, ag.childId activityId, ia.zone from InvoiceActivity ia
          left join ActivityGroup ag on ag.parentId = ia.activityId 
          where ia.status = 'APPROVE'
          UNION ALL 
          select ia.status, ia.activityId activityId, ia.zone from InvoiceActivity ia
          where ia.status = 'APPROVE') t where t.zone = ${item.plot} and t.activityId = ${item.ActivityId}
        `;

        const reject: { total: bigint }[] = await this.primaService.$queryRaw<
          { total: bigint }[]
        >`
          select count(*) total from (select ia.status, ag.childId activityId, ia.zone from InvoiceActivity ia
          left join ActivityGroup ag on ag.parentId = ia.activityId 
          where ia.status = 'REJECT'
          UNION ALL 
          select ia.status, ia.activityId activityId, ia.zone from InvoiceActivity ia
          where ia.status = 'REJECT') t where t.zone = ${item.plot} and t.activityId = ${item.ActivityId}
        `;
        return {
          ...item,
          approve:
            approve.reduce((prev, next) => prev + Number(next.total), 0) > 0,
          reject:
            reject.reduce((prev, next) => prev + Number(next.total), 0) > 0,
        };
      }),
    );

    memberWorkResult.activities = activities;

    return new ResponseHelper({ data: memberWorkResult });
  }

  async update(
    id: string,
    updateMemberWorkResultDto: UpdateMemberWorkResultDto,
  ) {
    if (!updateMemberWorkResultDto.companyId) {
      throw new BadRequestException(
        'Silahkan pilih perusahaan terlebih dahulu',
      );
    }

    const transaction = await this.primaService.$transaction(async (t) => {
      const memberWorkResult = await t.memberWorkResult.update({
        data: {
          companyId: updateMemberWorkResultDto.companyId,
          date: updateMemberWorkResultDto.date,
          employeeId: updateMemberWorkResultDto.employeeId,
        },
        where: {
          id,
        },
      });

      const payloadMemberWorkResultActivity: Prisma.MemberWorkResultActivityCreateManyInput[] =
        updateMemberWorkResultDto.activities.map((item) => {
          return {
            ActivityId: item.activityId,
            plot: item.plot,
            price: item.price,
            ql: item.ql,
            subTotal: item.subTotal,
            wide: item.wide,
            memberWorkResultId: memberWorkResult.id,
            id: item.id,
          };
        });

      const memberWorkResultActivity = await Promise.all(
        payloadMemberWorkResultActivity.map(async (item) => {
          if (item.id != null) {
            await t.memberWorkResultActivity.update({
              data: {
                ActivityId: item.ActivityId,
                plot: item.plot,
                price: item.price,
                ql: item.ql,
                subTotal: item.subTotal,
                wide: item.wide,
                memberWorkResultId: memberWorkResult.id,
              },
              where: {
                id: item.id,
              },
            });
          } else {
            await t.memberWorkResultActivity.create({
              data: {
                ActivityId: item.ActivityId,
                plot: item.plot,
                price: item.price,
                ql: item.ql,
                subTotal: item.subTotal,
                wide: item.wide,
                memberWorkResultId: memberWorkResult.id,
              },
            });
          }
        }),
      );

      const payloadMemberWorkResultBon: Prisma.MemberWorkResultBonCreateManyInput[] =
        updateMemberWorkResultDto.bon.map((item) => {
          return {
            note: item.note,
            total: item.total,
            memberWorkResultId: memberWorkResult.id,
          };
        });

      await t.memberWorkResultBon.deleteMany({
        where: {
          memberWorkResultId: memberWorkResult.id,
        },
      });
      const memberWorkResultBon = await t.memberWorkResultBon.createMany({
        data: payloadMemberWorkResultBon,
      });

      return {
        memberWorkResult,
        memberWorkResultActivity,
        memberWorkResultBon,
      };
    });

    return new ResponseHelper({ data: transaction });
  }

  async remove(id: string) {
    const exist = await this.primaService.memberWorkResult.findFirst({
      where: {
        id,
      },
    });

    if (!exist) {
      throw new BadRequestException('Data tidak ditemukan');
    }

    await this.primaService.memberWorkResult.delete({
      where: {
        id,
      },
    });

    return new ResponseHelper({ data: true });
  }

  async deleteActivity(id: string) {
    await this.primaService.memberWorkResultActivity.delete({
      where: {
        id,
      },
    });
    return new ResponseHelper({ data: true });
  }
}
