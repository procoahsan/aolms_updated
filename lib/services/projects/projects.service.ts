import 'server-only';
import {NotFoundException} from '@/lib/http';

import {Repository} from '@/lib/repository';
import { Project } from './projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';


export class ProjectsService {
  constructor(
    
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ order: { display_order: 'ASC', name: 'ASC', id: 'ASC' } });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectsRepository.preload({
      id: id,
      ...updateProjectDto,
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}
