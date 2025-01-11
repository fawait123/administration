import zod from 'zod'

export const accountingSchema = zod.object({
    invoice: zod.array(
        zod.string()
    ).min(1),
    accountName: zod.string().min(1),
    percentage: zod.string().min(1),
    additionals: zod.array(
        zod.object({
            note: zod.string().optional(),
            amount: zod.string().optional()
        })
    ).optional()
})
