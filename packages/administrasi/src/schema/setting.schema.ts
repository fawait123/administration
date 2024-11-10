import zod from 'zod'

export const settingCompanySchema = zod.object({
    name: zod.string().min(1),
    address: zod.string().min(1),
    email: zod.string().email().min(1),
    phone: zod.string().min(1),
    directure: zod.string().min(1),
    bankName: zod.string().min(1),
    bankBranch: zod.string().min(1),
    bankRekening: zod.string().min(1),
    bankOwner: zod.string().min(1)
})

export const settingTaxSchema = zod.object({
    tax: zod.string().min(1),
})
