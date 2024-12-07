import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  CreateInvoiceAddtionalDto,
  CreateInvoiceDto,
} from './dto/create-invoice.dto';
import {
  UpdateInvoiceAdditonalDto,
  UpdateInvoiceDto,
} from './dto/update-invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { InvoiceType } from 'libs/enum';
import { ApproveInvoiceDto } from './dto/approve.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly prismaService: PrismaService) {}

  // async validateWorkResult(createInvoiceDto: CreateInvoiceDto) {
  //   const data = [];
  //   await Promise.all(
  //     createInvoiceDto.invoiceActivites.map(async (ia) => {
  //       await Promise.all(
  //         ia.details.map(async (d) => {
  //           const duplicate = await this.prismaService.$queryRaw<
  //             {
  //               employee: string;
  //               activity: string;
  //               plot: string;
  //             }[]
  //           >`SELECT e.name employee, a.name activity, mwa.plot FROM administration.InvoiceActivityDetail ia
  //                       left join administration.MemberWorkResultActivity mwa on mwa.id = ia.memberWorkResultActivityId
  //                       left join administration.Activity a on a.id = mwa.ActivityId
  //                       left join administration.MemberWorkResult mw on mw.id = mwa.memberWorkResultId
  //                       left join administration.Employee e on e.id = mw.employeeId
  //                       where ia.memberWorkResultActivityId = ${d.memberWorkResultId}`;
  //           if (duplicate.length > 0) {
  //             data.push(
  //               `<b>${duplicate[0].employee} ${duplicate[0].plot} ${duplicate[0].plot}</b>`,
  //             );
  //           }
  //         }),
  //       );
  //     }),
  //   );
  //
  //   if (data.length > 0) {
  //     throw new BadRequestException(
  //       `Data hasil kerja anggota ${data.join(`, `)} sudah ditambahkan`,
  //     );
  //   }
  // }

  async validateBap(createInvoiceDto: CreateInvoiceDto) {
    const data = [];

    await Promise.all(
      createInvoiceDto.invoiceActivites.map(async (item) => {
        const duplicate = await this.prismaService.$queryRaw<
          {
            bapNumber: string;
          }[]
        >`select ia.bapNumber  from InvoiceActivity ia 
                  where ia.bapNumber = ${item.bapNumber}`;
        if (duplicate.length > 0) {
          data.push(`<b>${duplicate[0].bapNumber}</b>`);
        }
      }),
    );

    if (data.length > 0) {
      throw new BadRequestException(
        `Data BAP ${data.join(', ')} sudah digunakan`,
      );
    }
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        number: createInvoiceDto.number,
      },
    });

    if (exist) {
      throw new BadRequestException('Nomor invoice sudah digunakan');
    }

    await this.validateBap(createInvoiceDto);

    // await this.validateWorkResult(createInvoiceDto);

    const transaction = await this.prismaService.$transaction(async (t) => {
      const invoice = await t.invoice.create({
        data: {
          number: createInvoiceDto.number,
          companyId: createInvoiceDto.companyId,
          invoiceActivities: {
            create: createInvoiceDto.invoiceActivites.map((item) => {
              return {
                bapNumber: item.bapNumber,
                price: item.price,
                total: item.total,
                wide: item.wide,
                zone: item.zone,
                activityId: item.activityId,
                retensi: item.retensi,
                // details: {
                //   create: item.details.map((det) => {
                //     return {
                //       memberWorkResultActivityId: det.memberWorkResultId,
                //     };
                //   }),
                // },
              };
            }),
          },
        },
      });

      const retensi =
        createInvoiceDto.invoiceRetensi.length > 0
          ? await t.invoiceRetensi.createMany({
              data: createInvoiceDto.invoiceRetensi.map((item) => {
                return {
                  invoiceId: invoice.id,
                  note: item.note,
                  amount: item.amount,
                };
              }),
            })
          : [];

      return { invoice, retensi };
    });

    return new ResponseHelper({ data: transaction });
  }

  async createAdditional(createInvoiceDto: CreateInvoiceAddtionalDto) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        number: createInvoiceDto.number,
      },
    });

    if (exist) {
      throw new BadGatewayException('Nomor invoice sudah digunakan');
    }

    const transaction = await this.prismaService.$transaction(async (t) => {
      const invoice = await t.invoice.create({
        data: {
          number: createInvoiceDto.number,
          companyId: createInvoiceDto.companyId,
          type: 'ADDITIONAL',
          invoiceAdditionals: {
            create: createInvoiceDto.invoiceAdditionals.map((item) => {
              return {
                bapNumber: item.bapNumber,
                activityId: item.activityId,
                amount: item.amount,
                rent: item.rent,
              };
            }),
          },
        },
      });

      return { invoice };
    });

    return new ResponseHelper({ data: transaction });
  }

  async approve(approveDto: ApproveInvoiceDto) {
    if (approveDto.type === InvoiceType.ACTIVITY) {
      await this.prismaService.invoiceActivity.update({
        data: {
          status: approveDto.status,
        },
        where: {
          id: approveDto.id,
        },
      });
    }

    if (approveDto.type === InvoiceType.ADDITIONAL) {
      await this.prismaService.invoiceAdditional.update({
        data: {
          status: approveDto.status,
        },
        where: {
          id: approveDto.id,
        },
      });
    }

    return new ResponseHelper({ data: true });
  }

  async getByStatus(
    status: Prisma.EnumInvoiceStatusFilter | InvoiceStatus,
    company: Prisma.CompanyCreateInput,
  ) {
    const activity = (
      await this.prismaService.invoiceActivity.findMany({
        where: {
          status: status,
          Invoice: {
            companyId: company.id,
          },
        },
        include: {
          Invoice: true,
          activity: true,
        },
      })
    ).map((item) => {
      return {
        ...item,
        type: InvoiceType.ACTIVITY,
      };
    }) as (Prisma.InvoiceActivityCreateInput & { type: string })[];

    const additional = (
      await this.prismaService.invoiceAdditional.findMany({
        where: {
          status: status,
          invoice: {
            companyId: company.id,
          },
        },
        include: {
          invoice: true,
          activity: true,
        },
      })
    ).map((item) => {
      return {
        ...item,
        wide: 0,
        price: item.amount,
        zone: '-',
        total: item.amount,
        Invoice: item.invoice,
        type: InvoiceType.ADDITIONAL,
      };
    }) as (Prisma.InvoiceAdditionalCreateInput & {
      zone: string;
      wide: number;
      price: number;
      total: number;
      Invoice: Record<string, any>;
    })[];

    return new ResponseHelper({ data: [...activity, ...additional] });
  }

  findAll(query: PaginationDto, company: Prisma.CompanyCreateInput) {
    return paginate<Prisma.InvoiceFindManyArgs>(
      this.prismaService.invoice,
      new StatementScopeHelper<Prisma.InvoiceFindManyArgs>({ params: query }, [
        'number',
      ]),
      {
        where: {
          companyId: company.id,
        },
      },
    );
  }

  async getAllInvoice(company: Prisma.CompanyCreateInput) {
    const allInvoice = await this.prismaService.$queryRaw<
      {
        number: string;
        total: string;
        id: string;
      }[]
    >`select 
                i.number,
                i.id,
                (select sum(ia.total) from InvoiceActivity ia where ia.invoiceId = i.id) total
                from Invoice i 
                where i.status = 0
                and i.type = 'ACTIVITY'
                and i.companyId = ${company.id}
                UNION ALL
                select 
                i.number,
                i.id,
                (select sum(ia.amount) from InvoiceAdditional ia where ia.invoiceId = i.id) total
                from Invoice i 
                where i.status = 0
                and i.type = 'ADDITIONAL'
                and i.companyId  = ${company.id}`;
    return new ResponseHelper({ data: allInvoice });
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.invoice.findFirst({
      where: {
        id,
      },
      include: {
        invoiceActivities: {
          include: {
            activity: true,
            details: true,
          },
        },
        invoiceAdditionals: {
          include: {
            activity: true,
          },
        },
        invoiceRetensi: true,
      },
    });

    return new ResponseHelper({ data: invoice });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const transaction = await this.prismaService.$transaction(async (t) => {
      const invoice = await t.invoice.update({
        data: {
          number: updateInvoiceDto.number,
          companyId: updateInvoiceDto.companyId,
        },
        where: {
          id,
        },
      });
      const activity = await Promise.all(
        updateInvoiceDto.invoiceActivites.map(async (item) => {
          if (item.id != null) {
            await t.invoiceActivityDetail.deleteMany({
              where: {
                invoiceActivityId: item.id,
              },
            });
            await t.invoiceActivity.update({
              data: {
                bapNumber: item.bapNumber,
                price: item.price,
                total: item.total,
                wide: item.wide,
                zone: item.zone,
                activityId: item.activityId,
                retensi: item.retensi,
                // details: {
                //   create: item.details.map((det) => {
                //     return {
                //       memberWorkResultActivityId: det.memberWorkResultId,
                //     };
                //   }),
                // },
              },
              where: {
                id: item.id,
              },
            });
          } else {
            await t.invoiceActivity.create({
              data: {
                invoiceId: invoice.id,
                bapNumber: item.bapNumber,
                price: item.price,
                total: item.total,
                wide: item.wide,
                zone: item.zone,
                retensi: item.retensi,
                activityId: item.activityId,
                // details: {
                //   create: item.details.map((det) => {
                //     return {
                //       memberWorkResultActivityId: det.memberWorkResultId,
                //     };
                //   }),
                // },
              },
            });
          }
        }),
      );

      const retensi = await Promise.all(
        updateInvoiceDto.invoiceRetensi.map((item) => {
          if (item.id != null) {
            t.invoiceRetensi.update({
              data: {
                note: item.note,
                amount: item.amount,
              },
              where: {
                id: item.id,
              },
            });
          } else {
            t.invoiceRetensi.create({
              data: {
                note: item.note,
                amount: item.amount,
              },
            });
          }
        }),
      );

      return { invoice, activity, retensi };
    });

    return new ResponseHelper({ data: transaction });
  }

  async updateAdditional(
    id: string,
    updateInvoiceDto: UpdateInvoiceAdditonalDto,
  ) {
    const transaction = await this.prismaService.$transaction(async (t) => {
      const invoice = await t.invoice.update({
        data: {
          number: updateInvoiceDto.number,
          companyId: updateInvoiceDto.companyId,
          type: 'ADDITIONAL',
        },
        where: {
          id,
        },
      });

      const additonals = await Promise.all(
        updateInvoiceDto.invoiceAdditionals.map(async (item) => {
          if (item.id != null) {
            await t.invoiceAdditional.update({
              data: {
                bapNumber: item.bapNumber,
                activityId: item.activityId,
                amount: item.amount,
                rent: item.rent,
              },
              where: {
                id: item.id,
              },
            });
          } else {
            await t.invoiceAdditional.create({
              data: {
                bapNumber: item.bapNumber,
                activityId: item.activityId,
                amount: item.amount,
                invoiceId: invoice.id,
                rent: item.rent,
              },
            });
          }
        }),
      );

      return { invoice, additonals };
    });

    return new ResponseHelper({ data: transaction });
  }

  async remove(id: string) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        id,
      },
    });

    if (!exist) {
      throw new BadRequestException('Data tidak ditemukan');
    }

    await this.prismaService.$transaction(async (t) => {
      await t.invoiceAdditional.deleteMany({
        where: {
          invoiceId: id,
        },
      });

      await t.invoiceActivity.deleteMany({
        where: {
          invoiceId: id,
        },
      });

      await t.invoice.delete({
        where: {
          id,
        },
      });
    });

    return new ResponseHelper({ data: true });
  }

  async deleteActivity(id: string) {
    await this.prismaService.invoiceActivityDetail.deleteMany({
      where: {
        invoiceActivityId: id,
      },
    });

    await this.prismaService.invoiceActivity.delete({
      where: {
        id,
      },
    });

    return new ResponseHelper({ data: true });
  }

  async deleteAdditional(id: string) {
    await this.prismaService.invoiceAdditional.delete({
      where: {
        id,
      },
    });

    return new ResponseHelper({ data: true });
  }
}
