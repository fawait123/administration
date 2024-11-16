import { Transform, Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  retensi: boolean;

  @IsNotEmpty()
  @IsString()
  activityId: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => InvoiceActivityDetail)
  details: InvoiceActivityDetail[];

  @IsOptional()
  id: string | null;
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

  @IsOptional()
  id: string | null;

  @IsOptional()
  @IsBoolean()
  rent: boolean;
}

class InvoiceRetensi {
  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  id: string | null;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  number: string;

  @Transform(() => undefined)
  @Allow()
  companyId: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => InvoiceActivity)
  invoiceActivites: InvoiceActivity[];

  @IsOptional()
  @ValidateNested({ each: false })
  @IsArray()
  @Type(() => InvoiceRetensi)
  invoiceRetensi: InvoiceRetensi[];
}

export class CreateInvoiceAddtionalDto {
  @IsNotEmpty()
  @IsString()
  number: string;

  @Transform(() => undefined)
  @Allow()
  companyId: string;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => InvoiceAdditionals)
  invoiceAdditionals: InvoiceAdditionals[];
}
