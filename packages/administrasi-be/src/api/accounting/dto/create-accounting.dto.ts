import { Type } from "class-transformer";
import { Allow, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


class AccountingDetails {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsNumber()
    percentage: number

    @IsNotEmpty()
    @IsNumber()
    subTotal: number

    @IsNotEmpty()
    @IsNumber()
    expenses: number;

    @IsNotEmpty()
    @IsNumber()
    income: number;

    @IsOptional()
    expenseDetails: Record<string, any>
}

export class CreateAccountingDto {
    @IsNotEmpty()
    @IsString()
    invoiceId: string

    @Allow()
    companyId: string

    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => AccountingDetails)
    details: AccountingDetails[]
}