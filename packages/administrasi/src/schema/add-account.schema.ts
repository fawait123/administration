import zod from 'zod'

export const addAccountSchema = zod.object({
    name: zod.string().min(1),
    percentage: zod.string().min(1)
})
