import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateAssuranceTicketDto } from './create-assurance-ticket.dto';

export class UpdateAssuranceTicketDto extends PartialType(CreateAssuranceTicketDto) {}