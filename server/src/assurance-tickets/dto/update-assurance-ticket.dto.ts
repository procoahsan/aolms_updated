import { PartialType } from '@nestjs/mapped-types';
import { CreateAssuranceTicketDto } from './create-assurance-ticket.dto';

export class UpdateAssuranceTicketDto extends PartialType(CreateAssuranceTicketDto) {}