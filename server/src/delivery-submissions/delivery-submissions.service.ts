import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverySubmission, DeliveryStatus } from './delivery-submissions.entity';
import { CreateDeliverySubmissionDto } from './dto/create-delivery-submission.dto';
import { UpdateDeliverySubmissionDto } from './dto/update-delivery-submission.dto';
import { BusinessRulesService } from '../business-rules/business-rules.service';

@Injectable()
export class DeliverySubmissionsService {
  constructor(
    @InjectRepository(DeliverySubmission)
    private deliverySubmissionsRepository: Repository<DeliverySubmission>,
    private businessRulesService: BusinessRulesService,
  ) {}

  async create(createDeliverySubmissionDto: CreateDeliverySubmissionDto): Promise<DeliverySubmission> {
    const submission = this.deliverySubmissionsRepository.create({
      ...createDeliverySubmissionDto,
      status: DeliveryStatus.Draft,
      last_saved_at: new Date(),
    });
    return this.deliverySubmissionsRepository.save(submission);
  }

  async findOneByOrderId(orderId: string): Promise<DeliverySubmission> {
    const submission = await this.deliverySubmissionsRepository.findOne({
      where: { order_id: orderId },
    });
    if (!submission) {
      throw new NotFoundException(`Delivery submission for order ${orderId} not found`);
    }
    return submission;
  }

  async update(id: string, updateDeliverySubmissionDto: UpdateDeliverySubmissionDto): Promise<DeliverySubmission> {
    const submission = await this.deliverySubmissionsRepository.preload({
      id: id,
      ...updateDeliverySubmissionDto,
      last_saved_at: new Date(),
    });

    if (!submission) {
      throw new NotFoundException(`Delivery submission with ID ${id} not found`);
    }

    if (submission.status === DeliveryStatus.Submitted && !this.businessRulesService.canEditDeliverySubmission(submission)) {
      throw new ForbiddenException('Edit window has expired');
    }

    return this.deliverySubmissionsRepository.save(submission);
  }

  async submit(id: string): Promise<DeliverySubmission> {
    const submission = await this.deliverySubmissionsRepository.findOne({ where: { id } });

    if (!submission) {
      throw new NotFoundException(`Delivery submission with ID ${id} not found`);
    }

    if (submission.status === DeliveryStatus.Submitted && !this.businessRulesService.canEditDeliverySubmission(submission)) {
      throw new ForbiddenException('Edit window has expired');
    }

    submission.status = DeliveryStatus.Submitted;
    submission.submitted_at = new Date();
    submission.edit_deadline = this.businessRulesService.calculateEditDeadline(submission.submitted_at);

    return this.deliverySubmissionsRepository.save(submission);
  }

  async remove(id: string): Promise<void> {
    const result = await this.deliverySubmissionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Delivery submission with ID ${id} not found`);
    }
  }
}