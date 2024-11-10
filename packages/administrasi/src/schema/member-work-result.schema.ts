import zod from 'zod'

export const memberWorkResultSchema = zod.object({
    employeeId: zod.string().min(1),
    date: zod.string().min(1),
    activities: zod.array(zod.object({
        plot: zod.string().min(1),
        wide: zod.string().min(1),
        price: zod.string().min(1),
        activityId: zod.string().min(1),
        ql: zod.string(),
        subTotal: zod.number().min(1)
    })),
    bon: zod.array(
        zod.object({
            note: zod.string().optional(),
            total: zod.any().optional()
        })
    )
})
