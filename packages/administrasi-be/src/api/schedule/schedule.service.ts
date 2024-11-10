import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaClient } from "@prisma/client";
import { NotificationService } from "../notification/notification.service";
import { formatRupiah } from "libs/helpers";

@Injectable()
export class ScheduleService {
    private readonly logger = new Logger(ScheduleService.name);

    @Cron(CronExpression.EVERY_12_HOURS)
    async handleCron() {
        const prisma = new PrismaClient()
        const notificationService = new NotificationService()

        const invoice = await prisma.$queryRaw<{
            number_invoice: string,
            total_activity: string,
            total_amount: string
        }[]>`select 
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
        group by number_invoice`

        await Promise.all(
            invoice.map(async (item) => {
                const [number_invoice, companyId] = item.number_invoice.split('|')
                await notificationService.push({
                    title: 'Pembayaran Invoice',
                    body: `<span class="font-bold text-muted-color">Pemberitahuan</span> untuk melakukan penagihan invoice nomor
                            <span class="font-bold text-primary">${number_invoice}</span> dengan total
                            aktifitas <span class="font-bold text-primary">${item.total_activity}</span> dan total penagihan sebesar <span class="font-bold text-primary">${formatRupiah(+item.total_amount)}</span> yang belum dibayar`,
                    date: new Date(),
                    companyId: companyId
                })
                this.logger.debug(`sending notification invoice ${item.number_invoice}`)
            })
        )



        this.logger.debug('Job Running successfully');
    }
}