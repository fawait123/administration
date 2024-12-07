import zod from 'zod'

export const invoiceSchema = zod.object({
    number: zod.string().min(1),
    invoiceActivites: zod.array(zod.object({
        bapNumber: zod.string().min(1),
        zone: zod.string().min(1),
        activityId: zod.string().min(1),
        wide: zod.string().min(1),
        price: zod.string().min(1),
        total: zod.string().min(1),
        // details: zod.array(zod.string()).min(1)
    }))
})

export const invoiceAdditionalSchema = zod.object({
    number: zod.string().min(1),
    invoiceAdditionals: zod.array(zod.object({
        bapNumber: zod.string().min(1),
        amount: zod.string().min(1)
    }))
})
