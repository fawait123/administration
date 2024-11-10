import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ApiTags } from '@nestjs/swagger';
import { SettingCompanyDto, SettingTaxDto } from './dto/setting.dto';

@ApiTags('Setting')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Get('company')
  getCompany() {
    return this.settingService.getCompanySetting()
  }

  @Post('company')
  setCompany(
    @Body() settingCompanyDto: SettingCompanyDto
  ) {
    return this.settingService.setCompanySetting(settingCompanyDto)
  }

  @Get('tax')
  getTax() {
    return this.settingService.getTaxSetting()
  }

  @Post('tax')
  setTax(
    @Body() settingTaxDto: SettingTaxDto
  ) {
    return this.settingService.setTaxSetting(settingTaxDto)
  }
}
