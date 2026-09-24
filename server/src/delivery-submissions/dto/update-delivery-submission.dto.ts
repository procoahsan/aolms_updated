import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliverySubmissionDto } from './create-delivery-submission.dto';

export class UpdateDeliverySubmissionDto extends PartialType(
  CreateDeliverySubmissionDto,
) {}