import { Module } from '@nestjs/common';
import { MemberWorkResultService } from './member-work-result.service';
import { MemberWorkResultController } from './member-work-result.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MemberWorkResultController],
  providers: [MemberWorkResultService],
  imports: [PrismaModule]
})
export class MemberWorkResultModule { }
