import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateAssuranceSubmissionDto } from './create-assurance-submission.dto';

export class UpdateAssuranceSubmissionDto extends PartialType(
  CreateAssuranceSubmissionDto,
) {}