import { PartialType } from '@nestjs/swagger';
import { CreateMemberWorkResultDto } from './create-member-work-result.dto';

export class UpdateMemberWorkResultDto extends PartialType(
  CreateMemberWorkResultDto,
) {}
