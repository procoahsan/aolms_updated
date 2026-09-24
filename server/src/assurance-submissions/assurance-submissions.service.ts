import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssuranceSubmission, AssuranceSubmissionStatus } from './assurance-submissions.entity';
import { CreateAssuranceSubmissionDto } from './dto/create-assurance-submission.dto';
import { UpdateAssuranceSubmissionDto } from './dto/update-assurance-submission.dto';
import { BusinessRulesService } from '../business-rules/business-rules.service';

@Injectable()
export class AssuranceSubmissionsService {
  constructor(
    @InjectRepository(AssuranceSubmission)
    private assuranceSubmissionsRepository: Repository<AssuranceSubmission>,
    private businessRulesService: BusinessRulesService,
  ) {}

  async create(createAssuranceSubmissionDto: CreateAssuranceSubmissionDto): Promise<AssuranceSubmission> {
    const submission = this.assuranceSubmissionsRepository.create({
      ...createAssuranceSubmissionDto,
      status: AssuranceSubmissionStatus.Draft,
      last_saved_at: new Date(),
    });
    return this.assuranceSubmissionsRepository.save(submission);
  }

  async findOneByTicketId(ticketId: string): Promise<AssuranceSubmission> {
    const submission = await this.assuranceSubmissionsRepository.findOne({
      where: { ticket_id: ticketId },
    });
    if (!submission) {
      throw new NotFoundException(`Assurance submission for ticket ${ticketId} not found`);
    }
    return submission;
  }

  async update(id: string, updateAssuranceSubmissionDto: UpdateAssuranceSubmissionDto): Promise<AssuranceSubmission> {
    const submission = await this.assuranceSubmissionsRepository.preload({
      id: id,
      ...updateAssuranceSubmissionDto,
      last_saved_at: new Date(),
    });

    if (!submission) {
      throw new NotFoundException(`Assurance submission with ID ${id} not found`);
    }

    // Check if the submission is within the 24-hour edit window if it's already submitted
    if (submission.status === AssuranceSubmissionStatus.Submitted && !this.businessRulesService.canEditAssuranceSubmission(submission)) {
      throw new ForbiddenException('Edit window has expired');
    }

    return this.assuranceSubmissionsRepository.save(submission);
  }

  async submit(id: string): Promise<AssuranceSubmission> {
    const submission = await this.assuranceSubmissionsRepository.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Assurance submission with ID ${id} not found`);
    }

    // Check if the submission is within the 24-hour edit window if it's already submitted
    if (submission.status === AssuranceSubmissionStatus.Submitted && !this.businessRulesService.canEditAssuranceSubmission(submission)) {
      throw new ForbiddenException('Edit window has expired');
    }

    submission.status = AssuranceSubmissionStatus.Submitted;
    submission.submitted_at = new Date();
    submission.edit_deadline = this.businessRulesService.calculateEditDeadline(submission.submitted_at);

    return this.assuranceSubmissionsRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const result = await this.assuranceSubmissionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assurance submission with ID ${id} not found`);
    }
  }
}