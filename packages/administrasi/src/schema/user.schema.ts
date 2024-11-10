import zod from 'zod'

export const userSchema = zod.object({
    username: zod.string().min(1),
    email: zod.string().email().min(1),
    password: zod.string().min(8),
    roleId: zod.string().min(1)
})


export const userEditSchema = zod.object({
    username: zod.string().min(1),
    email: zod.string().email().min(1),
    password: zod.string().optional(),
    roleId: zod.string().min(1)
})
