import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'libs/dto/pagination.dto';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { CreateRoleDto } from './dto/create-role.dto';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async create(createRole: CreateRoleDto) {
    const exist = await this.prismaService.role.findFirst({
      where: {
        name: createRole.name
      }
    })

    if (exist) {
      throw new BadRequestException('Data role sudah digunakan');
    }

    const transaction = this.prismaService.$transaction(async (t) => {
      const role = await this.prismaService.role.create({
        data: {
          name: createRole.name,
          access: createRole.access,
        }
      })

      const companies = await Promise.all(
        [
          createRole.companies.map(async (item) => {
            return await this.prismaService.roleCompanies.create({
              data: {
                roleId: role.id,
                companyId: item
              }
            })
          })
        ]
      )

      return { role, companies }
    })

    return new ResponseHelper({ data: transaction })
  }

  async findAll(
    query: PaginationDto,
  ) {
    return paginate<Prisma.RoleFindManyArgs>(this.prismaService.role, new StatementScopeHelper<Prisma.RoleFindManyArgs>({ params: query }, ['name']), {
      where: {
        ...query.where,
      },
      include: {
        companies: true
      }
    })
  }

  async findOne(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: {
        id
      }
    })

    if (!role) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    return role
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const transaction = this.prismaService.$transaction(async (t) => {
      const role = await this.prismaService.role.update({
        data: {
          name: updateRoleDto.name,
          access: updateRoleDto.access,
        },
        where: {
          id
        }
      })

      await this.prismaService.roleCompanies.deleteMany({
        where: {
          roleId: role.id
        }
      })

      const companies = await Promise.all(
        [
          updateRoleDto.companies.map(async (item) => {
            return await this.prismaService.roleCompanies.create({
              data: {
                roleId: role.id,
                companyId: item
              }
            })
          })
        ]
      )

      return { role, companies }
    })

    return new ResponseHelper({ data: transaction })
  }

  async remove(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: {
        id
      }
    })

    if (!role) {
      throw new BadRequestException('Data pengguna tidak ditemukan');
    }

    await this.prismaService.roleCompanies.deleteMany({
      where: {
        roleId: id
      }
    })

    const deleteRole = await this.prismaService.role.delete({
      where: {
        id
      }
    })

    return deleteRole;
  }
}
