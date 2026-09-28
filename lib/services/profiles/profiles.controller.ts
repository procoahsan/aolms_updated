import 'server-only';

import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';




import { CreateAccountDto } from './dto/create-account.dto';





export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  
  
  createAccount( body: CreateAccountDto) {
    return this.profilesService.createAccount(body);
  }

  
  
  create( createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  
  
  findAll() {
    return this.profilesService.findAll();
  }

  
  
  findOne( id: string) {
    return this.profilesService.findOne(id);
  }

  
  
  update( id: string,  updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(id, updateProfileDto);
  }

  
  
  remove( id: string) {
    return this.profilesService.remove(id);
  }
}
