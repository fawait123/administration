import zod from 'zod'

export const accountingSchema = zod.object({
    invoiceId: zod.string().min(1),
})
