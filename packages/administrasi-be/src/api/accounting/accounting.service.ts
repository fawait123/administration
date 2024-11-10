import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { Prisma } from '@prisma/client';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';

@Injectable()
export class AccountingService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async create(createAccountingDto: CreateAccountingDto) {
    return this.prismaService.$transaction(async (t) => {
      const accounting = await t.accounting.create({
        data: {
          companyId: createAccountingDto.companyId,
          invoiceId: createAccountingDto.invoiceId,
          date: new Date(),
        }
      })

      const details = createAccountingDto.details.map((item) => {
        return {
          ...item,
          accountingId: accounting.id
        }
      })

      const accountingDetails = await t.accountingDetail.createMany({
        data: details
      })

      return { accounting, accountingDetails }
    })
  }

  findAll(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput
  ) {
    this.prismaService.memberWorkResult.findMany({

    })
    return paginate<Prisma.AccountingFindManyArgs>(this.prismaService.accounting, new StatementScopeHelper<Prisma.AccountingFindManyArgs>({ params: query }, ['name']), {
      include: {
        invoice: true,
        company: true
      },
      where: {
        companyId: company.id
      }
    })
  }

  async findOne(id: string) {
    const company = await this.prismaService.accounting.findUnique({
      where: {
        id
      },
      include: {
        invoice: true,
        company: true,
        AccountingDetail: true
      }
    })

    if (!company) {
      throw new BadRequestException('Data perusahaan tidak ditemukan');
    }

    return company
  }

  update(id: number, updateAccountingDto: UpdateAccountingDto) {
    return `This action updates a #${id} accounting`;
  }

  remove(id: number) {
    return `This action removes a #${id} accounting`;
  }
}
