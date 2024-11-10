import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateInvoiceAddtionalDto, CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
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
  constructor(private readonly prismaService: PrismaService) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        number: createInvoiceDto.number
      }
    })

    if (exist) {
      throw new BadGatewayException('Nomor invoice sudah digunakan')
    }

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
                details: {
                  create: item.details.map((det) => {
                    return {
                      memberWorkResultActivityId: det.memberWorkResultId
                    }
                  })
                }
              }
            }),
          }
        }
      });

      return { invoice }
    })

    return new ResponseHelper({ data: transaction })
  }

  async createAdditional(createInvoiceDto: CreateInvoiceAddtionalDto) {
    const exist = await this.prismaService.invoice.findFirst({
      where: {
        number: createInvoiceDto.number
      }
    })

    if (exist) {
      throw new BadGatewayException('Nomor invoice sudah digunakan')
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
              }
            })
          }
        }
      });

      return { invoice }
    })

    return new ResponseHelper({ data: transaction })
  }

  async approve(approveDto: ApproveInvoiceDto) {
    if (approveDto.type === InvoiceType.ACTIVITY) {
      await this.prismaService.invoiceActivity.update({
        data: {
          status: approveDto.status
        },
        where: {
          id: approveDto.id
        }
      })
    }

    if (approveDto.type === InvoiceType.ADDITIONAL) {
      await this.prismaService.invoiceAdditional.update({
        data: {
          status: approveDto.status
        },
        where: {
          id: approveDto.id
        }
      })
    }

    return new ResponseHelper({ data: true })
  }

  async getByStatus(status: Prisma.EnumInvoiceStatusFilter | InvoiceStatus, company: Prisma.CompanyCreateInput) {
    const activity = (await this.prismaService.invoiceActivity.findMany({
      where: {
        status: status,
        Invoice: {
          companyId: company.id
        }
      },
      include: {
        Invoice: true,
        activity: true
      }
    })).map((item) => {
      return {
        ...item,
        type: InvoiceType.ACTIVITY
      }
    }) as (Prisma.InvoiceActivityCreateInput & { type: string })[]

    const additional = (await this.prismaService.invoiceAdditional.findMany({
      where: {
        status: status,
        invoice: {
          companyId: company.id
        }
      },
      include: {
        invoice: true,
        activity: true
      }
    })).map((item) => {
      return {
        ...item,
        wide: 0,
        price: item.amount,
        zone: '-',
        total: item.amount,
        Invoice: item.invoice,
        type: InvoiceType.ADDITIONAL
      }
    }) as (Prisma.InvoiceAdditionalCreateInput & { zone: string, wide: number, price: number, total: number, Invoice: Record<string, any> })[]

    return new ResponseHelper({ data: [...activity, ...additional] })
  }

  findAll(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput
  ) {
    return paginate<Prisma.InvoiceFindManyArgs>(this.prismaService.invoice, new StatementScopeHelper<Prisma.InvoiceFindManyArgs>({ params: query }, ['number']), {
      where: {
        companyId: company.id
      }
    })
  }

  async getAllInvoice(company: Prisma.CompanyCreateInput) {
    const allInvoice = await this.prismaService.$queryRaw<{
      number: string,
      total: string,
      id: string
    }[]>`select 
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
                and i.companyId  = ${company.id}`
    return new ResponseHelper({ data: allInvoice })
  }

  async findOne(id: string) {
    const invoice = await this.prismaService.invoice.findFirst({
      where: {
        id
      },
      include: {
        invoiceActivities: {
          include: {
            activity: true
          }
        },
        invoiceAdditionals: {
          include: {
            activity: true
          }
        }
      }
    })

    return new ResponseHelper({ data: invoice })
  }

  update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
