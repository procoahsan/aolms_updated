import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateDeliverySubmissionDto } from './create-delivery-submission.dto';

export class UpdateDeliverySubmissionDto extends PartialType(
  CreateDeliverySubmissionDto,
) {}