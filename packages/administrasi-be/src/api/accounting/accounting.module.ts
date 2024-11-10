import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService],
  imports: [PrismaModule]
})
export class AccountingModule { }
