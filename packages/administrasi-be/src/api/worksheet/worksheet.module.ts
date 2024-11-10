import { Module } from '@nestjs/common';
import { WorksheetService } from './worksheet.service';
import { WorksheetController } from './worksheet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [WorksheetController],
  providers: [WorksheetService],
  imports: [PrismaModule]
})
export class WorksheetModule { }
