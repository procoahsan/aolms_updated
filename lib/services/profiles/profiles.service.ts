import 'server-only';
import {BadRequestException,InternalServerErrorException,NotFoundException} from '@/lib/http';

import {Repository} from '@/lib/repository';
import { Profile } from './profiles.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { SupabaseService } from '../supabase/supabase.service';


export class ProfilesService {
  constructor(
    
    private profilesRepository: Repository<Profile>,
    private supabaseService: SupabaseService,
  ) {}

  async createAccount(input: CreateAccountDto): Promise<Profile> {
    const { password, ...fields } = input;
    const email = fields.email?.trim().toLowerCase();
    const full_name = fields.full_name.trim();
    if (!email || !full_name) throw new BadRequestException('Name and email are required');
    const admin = this.supabaseService.getClient().auth.admin;
    const { data, error } = await admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name },
    });
    if (error) throw new BadRequestException(error.message);
    if (!data.user) throw new InternalServerErrorException('Unable to create login account');

    try {
      // Upsert also supports projects that create a default profile in an Auth trigger.
      await this.profilesRepository.upsert({
        id: data.user.id, email, full_name,
        employee_code: fields.employee_code.trim() || null,
        role: fields.role, is_active: fields.is_active ?? true,
      }, ['id']);
      return await this.findOne(data.user.id);
    } catch (error) {
      const cleanup = await admin.deleteUser(data.user.id);
      if (cleanup.error) {
        throw new InternalServerErrorException('Profile creation failed and the login account could not be removed. Contact support before retrying.');
      }
      if ((error as { code?: string }).code === '23505') {
        throw new BadRequestException('Employee code is already in use');
      }
      throw new InternalServerErrorException('Unable to save user profile. The login account was removed; please try again.');
    }
  }

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profilesRepository.create(createProfileDto);
    return this.profilesRepository.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return this.profilesRepository.find();
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profilesRepository.preload({
      id: id,
      ...updateProfileDto,
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return this.profilesRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const result = await this.profilesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
  }
}
