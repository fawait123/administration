import { Injectable } from '@nestjs/common';
import { PushNotificationDto } from './dto/push.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { paginate } from 'libs/helpers/pagination.helper';
import { StatementScopeHelper } from 'libs/helpers/statement-scope.helper';
import { PaginationDto } from 'libs/dto/pagination.dto';

@Injectable()
export class NotificationService {
  async push(pushNotificationDto: PushNotificationDto) {
    const prisma = new PrismaClient();

    const notification = await prisma.notification.create({
      data: {
        title: pushNotificationDto.title,
        body: pushNotificationDto.body,
        date: pushNotificationDto.date,
        companyId: pushNotificationDto.companyId,
        additional: pushNotificationDto.additional,
      },
    });

    return notification;
  }

  async getCurrentNotification(
    query: PaginationDto,
    company: Prisma.CompanyCreateInput,
  ) {
    const prisma = new PrismaClient();

    if (!query.where) {
      query.where = {};
    }

    return paginate<Prisma.NotificationFindManyArgs>(
      prisma.notification,
      new StatementScopeHelper<Prisma.NotificationFindManyArgs>(
        { params: query },
        ['title'],
      ),
      {
        where: {
          companyId: company.id,
          ...query.where,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    );
  }
}
