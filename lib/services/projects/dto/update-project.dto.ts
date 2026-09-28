import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}