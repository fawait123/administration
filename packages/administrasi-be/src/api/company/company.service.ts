import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async create(createCompany: Prisma.CompanyCreateInput) {
    return await this.prismaService.company.create({
      data: createCompany
    })
  }

  async findAll(
    query: PaginationDto
  ) {
    return paginate(this.prismaService.company, new StatementScopeHelper<Prisma.CompanyFindFirstArgs>({ params: query }, ['name', 'address']))
  }

  async findOne(id: string) {
    const company = await this.prismaService.company.findUnique({
      where: {
        id
      }
    })

    if (!company) {
      throw new BadRequestException('Data perusahaan tidak ditemukan');
    }

    return company
  }

  async update(id: string, updateCompanyDto: Prisma.CompanyUpdateInput) {
    const company = await this.prismaService.company.findUnique({
      where: {
        id
      }
    })

    if (!company) {
      throw new BadRequestException('Data perusahaan tidak ditemukan');
    }

    const companyUpdate = await this.prismaService.company.update({
      where: {
        id
      },
      data: updateCompanyDto
    })
    return companyUpdate;
  }

  async remove(id: string) {
    const company = await this.prismaService.company.findUnique({
      where: {
        id
      }
    })

    if (!company) {
      throw new BadRequestException('Data perusahaan tidak ditemukan');
    }

    const deleteCompany = await this.prismaService.company.delete({
      where: {
        id
      }
    })
    return deleteCompany;
  }
}
