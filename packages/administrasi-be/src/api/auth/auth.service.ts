import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { compare } from 'libs/helpers/encryption.helper';
import { JwtService } from '@nestjs/jwt';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: authDto.username,
          },
          {
            email: authDto.password,
          },
        ],
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    if (!compare(authDto.password, user.password)) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const token = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    delete user.password;
    return new ResponseHelper({
      data: {
        user,
        token: token,
      },
    });
  }

  async profile(req: Request & { user: Record<string, any> }) {
    return new ResponseHelper({ data: req.user });
  }
}
