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
      }[]
    >`select 
        CONCAT(i.number,'|',i.companyId) as number_invoice,
        COUNT(ia.status) as total_activity,
        SUM(ia.total) as total_amount
        from Invoice i 
        left join InvoiceActivity ia 
        on i.id = ia.invoiceId 
        where ia.status = 'NEEDAPPROVAL'
        group by number_invoice
        UNION ALL 
        select 
        CONCAT(i.number,'|',i.companyId) as number_invoice,
        COUNT(ia2.status) as total_activity,
        SUM(ia2.amount)  as total_amount
        from Invoice i 
        left join InvoiceAdditional ia2
        on i.id = ia2.invoiceId 
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
      }[]
    >`select mwr.date, e.name,mwr.companyId,
        (select ia.status status from InvoiceActivityDetail ad left join InvoiceActivity ia on ad.invoiceActivityId = ia.id where ad.memberWorkResultActivityId = mwr.id and ia.status = 'APPROVE') status_approve,
        (select ia.status status from InvoiceActivityDetail ad left join InvoiceActivity ia on ad.invoiceActivityId = ia.id where ad.memberWorkResultActivityId = mwr.id and ia.status = 'REJECT') status_reject,
        (select count(mwra.id) from MemberWorkResultActivity mwra where mwra.memberWorkResultId = mwr.id) total_activity
        from MemberWorkResult mwr 
        left join Employee e on e.id  = mwr.employeeId 
        having status_approve is NULL or status_reject is null`;

    const now = moment();
    await Promise.all(
      data.map(async (item) => {
        await notificationService.push({
          title: 'Pemberitahuan Pembayaran',
          body: `<span class="font-bold text-muted-color">Pemberitahuan</span> untuk melakukan pembayaran pekerja 
                            <span class="font-bold text-primary">${item.name}</span> dengan total
                            aktifitas <span class="font-bold text-primary">${item.total_activity}</span>, Pembayaran belum dilakukan sejak <span class="font-bold text-primary">${now.diff(item.date, 'days')}</span> hari yang lalu`,
          date: moment().add('1', 'days').toDate(),
          companyId: item.companyId,
        });
        this.logger.debug(`sending notification ${item.name}`);
      }),
    );

    this.logger.debug('Job Running successfully');
  }
}
