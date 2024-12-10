import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnv, setEnv } from 'libs/helpers';
import { ResponseHelper } from 'libs/helpers/response.helper';
import { SettingCompanyDto, SettingTaxDto } from './dto/setting.dto';

@Injectable()
export class SettingService {
  getCompanySetting() {
    return new ResponseHelper({
      data: {
        name: getEnv('setting.env', 'COMPANY_NAME'),
        email: getEnv('setting.env', 'COMPANY_EMAIL'),
        phone: getEnv('setting.env', 'COMPANY_PHONE'),
        address: getEnv('setting.env', 'COMPANY_ADDRESS'),
        directure: getEnv('setting.env', 'COMPANY_DIRECTURE'),
        bankName: getEnv('setting.env', 'COMPANY_BANK_NAME'),
        bankBranch: getEnv('setting.env', 'COMPANY_BANK_BRANCH'),
        bankRekening: getEnv('setting.env', 'COMPANY_BANK_REKENING'),
        bankOwner: getEnv('setting.env', 'COMPANY_BANK_OWNER'),
      },
    });
  }

  setCompanySetting(settingCompanyDto: SettingCompanyDto) {
    setEnv('setting.env', 'COMPANY_NAME', settingCompanyDto.name);
    setEnv('setting.env', 'COMPANY_EMAIL', settingCompanyDto.email);
    setEnv('setting.env', 'COMPANY_PHONE', settingCompanyDto.phone);
    setEnv('setting.env', 'COMPANY_ADDRESS', settingCompanyDto.address);
    setEnv('setting.env', 'COMPANY_DIRECTURE', settingCompanyDto.directure);
    setEnv('setting.env', 'COMPANY_BANK_NAME', settingCompanyDto.bankName);
    setEnv('setting.env', 'COMPANY_BANK_BRANCH', settingCompanyDto.bankBranch);
    setEnv(
      'setting.env',
      'COMPANY_BANK_REKENING',
      settingCompanyDto.bankRekening,
    );
    setEnv('setting.env', 'COMPANY_BANK_OWNER', settingCompanyDto.bankOwner);
    return this.getCompanySetting();
  }

  getTaxSetting() {
    return new ResponseHelper({
      data: {
        amount: getEnv('tax.env', 'TAX_AMOUNT'),
      },
    });
  }

  setTaxSetting(settingTaxDto: SettingTaxDto) {
    setEnv('tax.env', 'TAX_AMOUNT', settingTaxDto.amount);
    return this.getTaxSetting();
  }
}
