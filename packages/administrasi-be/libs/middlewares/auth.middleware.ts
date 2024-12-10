import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(
    req: Request & { user: Record<string, any> },
    res: any,
    next: () => void,
  ) {
    const autorization = req.headers.authorization;

    if (!autorization) {
      throw new BadRequestException('Silahkan login terlebih dahulu');
    }

    const [bearer, token] = autorization.split(' ');

    if (!token) {
      throw new BadRequestException('Silahkan login terlebih dahulu');
    }

    const jwtService = new JwtService();
    const prisma = new PrismaClient();

    const decode = await jwtService.decode(token);
    const user = await prisma.user.findFirst({
      where: {
        username: decode.username,
      },
      include: {
        role: {
          include: {
            companies: true,
          },
        },
      },
    });

    req.user = user;

    next();
  }
}
