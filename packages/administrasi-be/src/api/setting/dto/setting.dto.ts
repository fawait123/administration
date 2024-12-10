import { IsNotEmpty, IsString } from 'class-validator';

export class SettingCompanyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  directure: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  bankBranch: string;

  @IsNotEmpty()
  @IsString()
  bankRekening: string;

  @IsNotEmpty()
  @IsString()
  bankOwner: string;
}

export class SettingTaxDto {
  amount: string;
}
