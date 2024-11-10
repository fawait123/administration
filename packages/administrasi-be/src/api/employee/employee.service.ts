import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Employee")
@Injectable()
export class EmployeeService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async create(createActivity: Prisma.EmployeeCreateInput) {
    return await this.prismaService.employee.create({
      data: createActivity
    })
  }

  async findAll(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput
  ) {
    return paginate<Prisma.EmployeeFindManyArgs>(this.prismaService.employee, new StatementScopeHelper<Prisma.EmployeeFindManyArgs>({ params: query }, ['name']), {
      where: {
        companyId: company.id
      }
    })
  }

  async findOne(id: string) {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id
      }
    })

    if (!employee) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    return employee
  }

  async update(id: string, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id
      }
    })

    if (!employee) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const employeeUpdate = await this.prismaService.employee.update({
      where: {
        id
      },
      data: updateEmployeeDto
    })
    return employeeUpdate;
  }

  async remove(id: string) {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id
      }
    })

    if (!employee) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    const deleteEmployee = await this.prismaService.employee.delete({
      where: {
        id
      }
    })
    return deleteEmployee;
  }
}
