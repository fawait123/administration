import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { formatRupiah } from 'libs/helpers';
import * as moment from 'moment';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    const prisma = new PrismaClient();
    const notificationService = new NotificationService();

    const invoice = await prisma.$queryRaw<
      {
        number_invoice: string;
        total_activity: string;
        total_amount: string;
        additional: string;
      }[]
    >`		select 
        CONCAT(i.number,'|',i.companyId) as number_invoice,
        COUNT(ia.status) as total_activity,
        SUM(ia.total) as total_amount,
        GROUP_CONCAT(a.name) as additional
        from Invoice i 
        left join InvoiceActivity ia 
        on i.id = ia.invoiceId 
        left join Activity a 
        on a.id = ia.activityId
        where ia.status = 'NEEDAPPROVAL'
        group by number_invoice
        UNION ALL 
        select 
        CONCAT(i.number,'|',i.companyId) as number_invoice,
        COUNT(ia2.status) as total_activity,
        SUM(ia2.amount)  as total_amount,
        GROUP_CONCAT(a.name) as additional
        from Invoice i 
        left join InvoiceAdditional ia2
        on i.id = ia2.invoiceId 
        left join Activity a
        on a.id = ia2.activityId
        where ia2.status = 'NEEDAPPROVAL'
        group by number_invoice`;

    await Promise.all(
      invoice.map(async (item) => {
        const [number_invoice, companyId] = item.number_invoice.split('|');
        await notificationService.push({
          title: 'Pembayaran Invoice',
          body: `<span class="font-bold text-muted-color">Pemberitahuan</span> untuk melakukan penagihan invoice nomor
                            <span class="font-bold text-primary">${number_invoice}</span> dengan total
                            aktifitas <span class="font-bold text-primary">${item.total_activity}</span> dan total penagihan sebesar <span class="font-bold text-primary">${formatRupiah(+item.total_amount)}</span> yang belum dibayar`,
          date: moment().add('1', 'days').toDate(),
          companyId: companyId,
          additional: item.additional
        });
        this.logger.debug(
          `sending notification invoice ${item.number_invoice}`,
        );
      }),
    );

    this.logger.debug('Job Running successfully');
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCronMemberWorkResult() {
    console.log(moment().toDate());
    const prisma = new PrismaClient();
    const notificationService = new NotificationService();

    const data = await prisma.$queryRaw<
      {
        date: string;
        name: string;
        status_approve: string | null;
        status_reject: string | null;
        total_activity: number;
        companyId: string;
        additional: string;
      }[]
    >`select mwr.date, e.name,mwr.companyId, CONCAT(mwra2.plot,'|',a.name) additional, 
        (SELECT ia.status AS total FROM InvoiceActivity ia WHERE ia.zone = mwra2.plot AND ia.activityId = mwra2.activityId AND ia.status = 'APPROVE' LIMIT 1) status_approve,
        (SELECT ia.status AS total FROM InvoiceActivity ia WHERE ia.zone = mwra2.plot AND ia.activityId = mwra2.activityId AND ia.status = 'REJECT' LIMIT 1) status_reject,
        (select count(mwra.id) from MemberWorkResultActivity mwra where mwra.memberWorkResultId = mwr.id) total_activity
        from MemberWorkResult mwr 
        left join Employee e on e.id  = mwr.employeeId 
        left join MemberWorkResultActivity mwra2 on mwra2.memberWorkResultId = mwr.id
        left join Activity a on a.id  = mwra2.ActivityId 
        having status_approve is NULL and status_reject is null`;

    const now = moment();
    await Promise.all(
      data.map(async (item) => {
        const [plot, activityName] = item.additional.split('|');
        await notificationService.push({
          title: 'Pemberitahuan Pembayaran',
          body: `<span class="font-bold text-muted-color">Pemberitahuan</span> untuk melakukan pembayaran pekerja 
                            <span class="font-bold text-primary">${item.name}</span> dengan aktifitas <span class="font-bold text-primary">${plot} ${activityName}</span>, Pembayaran belum dilakukan sejak <span class="font-bold text-primary">${now.diff(item.date, 'days')}</span> hari yang lalu`,
          date: moment().add('1', 'days').toDate(),
          companyId: item.companyId,
          additional: item.additional
        });
        this.logger.debug(`sending notification ${item.name}`);
      }),
    );

    this.logger.debug('Job Running successfully');
  }
}
