import zod from 'zod'

export const companySchema = zod.object({
    name: zod.string().min(1),
    address: zod.string().min(1),
    email: zod.string().email().min(1),
    phone: zod.string().min(1),
})
