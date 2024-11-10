import { InvoiceStatus } from "@prisma/client"
import { IsEnum, IsNotEmpty, IsString } from "class-validator"
import { InvoiceType } from "libs/enum"

export class ApproveInvoiceDto {
    @IsNotEmpty()
    @IsString()
    @IsEnum(InvoiceType)
    type: string

    @IsNotEmpty()
    @IsString()
    id: string

    @IsNotEmpty()
    @IsString()
    status: InvoiceStatus
}