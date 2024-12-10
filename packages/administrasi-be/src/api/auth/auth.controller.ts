import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  create(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get('profile')
  profile(@Req() req: Request & { user: Record<string, any> }) {
    return this.authService.profile(req);
  }
}
