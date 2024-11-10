import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prismaService: PrismaService) { }

    async getCardData(company: Prisma.CompanyCreateInput) {
        const totalInvoice = await this.prismaService.$queryRaw<{
            total_invoice: string
        }[]>`select sum(ac.total) as total_invoice from (
                            select COALESCE(SUM(ia.total),0) as total from InvoiceActivity ia 
                            left join Invoice i on i.id = ia.invoiceId
                            where i.companyId = ${company.id}
                            UNION ALL
                            select COALESCE(SUM(ia.amount),0) as total from InvoiceAdditional ia
                            left join Invoice i on i.id = ia.invoiceId
                            where i.companyId = ${company.id}
                            ) as ac`
        const totalActivity = await this.prismaService.$queryRaw<{
            total_activity: string
        }[]>`select COALESCE(SUM(mwra.subTotal),0) total_activity from MemberWorkResultActivity mwra
                            left join MemberWorkResult mwr on mwr.id = mwra.memberWorkResultId 
                            where mwr.companyId  = ${company.id}`

        return new ResponseHelper({
            data: {
                totalActivity: totalActivity.reduce((prev, next) => prev + +next.total_activity, 0),
                totalInvoice: totalInvoice.reduce((prev, next) => prev + +next.total_invoice, 0)
            }
        })
    }
}
