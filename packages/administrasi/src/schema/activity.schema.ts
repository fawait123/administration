import zod from 'zod'

export const activitySchema = zod.object({
    name: zod.string().min(1),
})
