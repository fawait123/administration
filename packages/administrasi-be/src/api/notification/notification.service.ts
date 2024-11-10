import { Injectable } from '@nestjs/common';
import { PushNotificationDto } from './dto/push.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { ResponseHelper } from 'libs/helpers/response.helper';
import * as moment from 'moment';

@Injectable()
export class NotificationService {
    async push(pushNotificationDto: PushNotificationDto) {
        const prisma = new PrismaClient()

        const notification = await prisma.notification.create({
            data: {
                title: pushNotificationDto.title,
                body: pushNotificationDto.body,
                date: pushNotificationDto.date,
                companyId: pushNotificationDto.companyId
            }
        })

        return notification
    }

    async getCurrentNotification(company: Prisma.CompanyCreateInput) {
        const prisma = new PrismaClient()

        const notifications = await prisma.notification.findMany({
            where: {
                date: {
                    gte: moment().startOf('day').toDate(),
                    lt: moment().endOf('day').toDate()
                },
                companyId: company.id
            }
        })

        return new ResponseHelper({ data: notifications })
    }
}
