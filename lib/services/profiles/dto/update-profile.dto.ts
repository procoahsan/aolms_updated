import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}