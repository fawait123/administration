import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();


    if (!request.headers['x-company-id']) {
      throw new BadRequestException('Silahkan pilih Perusahaan terlebih dahulu')
    }

    const company = await this.prismaService.company.findFirst({
      where: {
        id: request.headers['x-company-id']
      }
    })

    if (!company) {
      throw new BadRequestException('Perusahaan yang di pilih tidak sesuai')
    }

    request.company = company;

    return true;
  }
}
