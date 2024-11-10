import { Transform, Type } from "class-transformer";
import { Allow, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


class InvoiceActivityDetail {
    memberWorkResultId: string;
}

class InvoiceActivity {
    @IsNotEmpty()
    @IsString()
    bapNumber: string;

    @IsNotEmpty()
    @IsString()
    zone: string;

    @IsNotEmpty()
    @IsNumber()
    wide: number;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    total: number;

    @IsNotEmpty()
    @IsString()
    activityId: string;

    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => InvoiceActivityDetail)
    details: InvoiceActivityDetail[]
}


class InvoiceAdditionals {
    @IsNotEmpty()
    @IsString()
    activityId: string;

    @IsNotEmpty()
    @IsString()
    bapNumber: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;
}


export class CreateInvoiceDto {
    @IsNotEmpty()
    @IsString()
    number: string

    @Transform(() => undefined)
    @Allow()
    companyId: string;

    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => InvoiceActivity)
    invoiceActivites: InvoiceActivity[]
}

export class CreateInvoiceAddtionalDto {
    @IsNotEmpty()
    @IsString()
    number: string

    @Transform(() => undefined)
    @Allow()
    companyId: string;

    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => InvoiceAdditionals)
    invoiceAdditionals: InvoiceAdditionals[]
}