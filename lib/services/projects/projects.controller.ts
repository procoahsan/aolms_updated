import 'server-only';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';









export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  
  
  create( createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  
  
  findAll() {
    return this.projectsService.findAll();
  }

  
  
  findOne( id: string) {
    return this.projectsService.findOne(id);
  }

  
  
  update( id: string,  updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  
  
  remove( id: string) {
    return this.projectsService.remove(id);
  }
}