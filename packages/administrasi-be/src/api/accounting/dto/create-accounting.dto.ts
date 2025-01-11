import { Transform, Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountingDto {
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @IsNotEmpty()
  @IsNumber()
  percentage: number;

  @IsOptional()
  @IsArray()
  additionals?: []

  @IsNotEmpty()
  @IsArray()
  profitAndLossInvoice: string[]

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsNumber()
  profit: number;
}