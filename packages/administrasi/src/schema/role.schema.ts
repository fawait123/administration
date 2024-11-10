import zod from 'zod'

export const roleSchema = zod.object({
    name: zod.string().min(1),
    access: zod.array(zod.string().min(1)).min(1),
    companies: zod.array(zod.string().min(1)).min(1),
})
