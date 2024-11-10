import zod from 'zod'

export const employeeSchema = zod.object({
    name: zod.string().min(1),
})
