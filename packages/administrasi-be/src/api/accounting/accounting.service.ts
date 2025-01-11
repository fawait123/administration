import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { ResponseHelper } from 'libs/helpers/response.helper';

@Injectable()
export class AccountingService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createAccountingDto: CreateAccountingDto) {
    return this.prismaService.$transaction(async (t) => {
      const accounting = await t.profitAndLoss.create({
        data: {
          accountName: createAccountingDto.accountName,
          percentage: createAccountingDto.percentage,
          additionals: createAccountingDto.additionals,
          total: createAccountingDto.total,
          profit: createAccountingDto.profit
        },
      });

      const invoices = await t.profitAndLossInvoice.createMany({
        data: createAccountingDto.profitAndLossInvoice.map((item) => {
          return {
            ProfitAndLossId: accounting.id,
            invoiceId: item
          };
        }),
      })

      return { accounting, invoices };
    });
  }

  findAll(query: PaginationDto, company: Prisma.CompanyCreateInput) {
    return paginate<Prisma.ProfitAndLossFindManyArgs>(
      this.prismaService.profitAndLoss,
      new StatementScopeHelper<Prisma.ProfitAndLossFindManyArgs>(
        { params: query },
        ['name'],
      ),
      {
        orderBy: {
          createdAt: 'desc'
        }
      },
    );
  }

  async findOne(id: string) {
    const company = await this.prismaService.profitAndLoss.findUnique({
      where: {
        id,
      },
      include: {
        profitLooseInvoices: {
          include: {
            invoice: true
          }
        },
      },
    });

    if (!company) {
      throw new BadRequestException('Data perusahaan tidak ditemukan');
    }

    return new ResponseHelper({ data: company });
  }

  update(id: string, updateAccountingDto: UpdateAccountingDto) {
    return this.prismaService.$transaction(async (t) => {
      const accounting = await t.profitAndLoss.update({
        data: {
          accountName: updateAccountingDto.accountName,
          percentage: updateAccountingDto.percentage,
          additionals: updateAccountingDto.additionals,
          total: updateAccountingDto.total,
          profit: updateAccountingDto.profit
        },
        where: {
          id
        }
      });

      await t.profitAndLossInvoice.deleteMany({
        where: {
          ProfitAndLossId: id
        }
      })

      const invoices = await t.profitAndLossInvoice.createMany({
        data: updateAccountingDto.profitAndLossInvoice.map((item) => {
          return {
            ProfitAndLossId: accounting.id,
            invoiceId: item
          };
        }),
      })

      return { accounting, invoices };
    });
  }

  async remove(id: string) {
    return await this.prismaService.$transaction(async (transaction) => {
      const invoice = await transaction.profitAndLossInvoice.deleteMany({
        where: {
          ProfitAndLossId: id
        }
      })

      const profit = await transaction.profitAndLoss.delete({
        where: {
          id: id
        }
      })

      return { invoice, profit }
    })
  }
}
