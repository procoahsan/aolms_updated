import 'server-only';

import { DeliverySubmissionsService } from './delivery-submissions.service';
import { CreateDeliverySubmissionDto } from './dto/create-delivery-submission.dto';
import { UpdateDeliverySubmissionDto } from './dto/update-delivery-submission.dto';









export class DeliverySubmissionsController {
  constructor(private deliverySubmissionsService: DeliverySubmissionsService) {}

  
  
  create( createDeliverySubmissionDto: CreateDeliverySubmissionDto) {
    return this.deliverySubmissionsService.create(createDeliverySubmissionDto);
  }

  
  
  findOneByOrderId( orderId: string) {
    return this.deliverySubmissionsService.findOneByOrderId(orderId);
  }

  
  
  update( id: string,  updateDeliverySubmissionDto: UpdateDeliverySubmissionDto) {
    return this.deliverySubmissionsService.update(id, updateDeliverySubmissionDto);
  }

  
  
  submit( id: string) {
    return this.deliverySubmissionsService.submit(id);
  }

  
  
  remove( id: string) {
    return this.deliverySubmissionsService.remove(id);
  }
}