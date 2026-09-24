import { PartialType } from '@nestjs/mapped-types';
import { CreateAssuranceSubmissionDto } from './create-assurance-submission.dto';

export class UpdateAssuranceSubmissionDto extends PartialType(
  CreateAssuranceSubmissionDto,
) {}