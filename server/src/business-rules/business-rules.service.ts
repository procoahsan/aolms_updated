import { Injectable } from '@nestjs/common';
import { Profile } from '../profiles/profiles.entity';
import { Order } from '../orders/orders.entity';
import { DeliverySubmission } from '../delivery-submissions/delivery-submissions.entity';
import { AssuranceSubmission } from '../assurance-submissions/assurance-submissions.entity';

@Injectable()
export class BusinessRulesService {
  /**
   * Check if a technician is eligible to see an order.
   * An order is visible to a technician only if:
   * 1. A specific Technician has been selected (order.technician_id is set and matches the technician's id)
   * 2. order.action = 'Delivered'
   */
  isTechnicianEligibleForOrder(order: Order, technicianId: string): boolean {
    return order.technician_id === technicianId && order.action === 'Delivered';
  }

  /**
   * Check if a submission is within the 24-hour edit window.
   * @param submittedAt The submission timestamp
   * @returns true if the current time is within 24 hours of submittedAt
   */
  isWithinEditWindow(submittedAt: Date): boolean {
    const now = new Date();
    const editWindowEnd = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    return now <= editWindowEnd;
  }

  /**
   * Check if a delivery submission can be edited.
   * A submission can be edited if:
   * 1. Its status is 'submitted' (not 'draft' or 'locked')
   * 2. It is within the 24-hour edit window
   */
  canEditDeliverySubmission(submission: DeliverySubmission): boolean {
    return submission.status === 'submitted' && this.isWithinEditWindow(submission.submitted_at);
  }

  /**
   * Check if an assurance submission can be edited.
   * Same rules as delivery submission.
   */
  canEditAssuranceSubmission(submission: AssuranceSubmission): boolean {
    return submission.status === 'submitted' && this.isWithinEditWindow(submission.submitted_at);
  }

  /**
   * Determine the status of a submission based on its timestamps.
   * This is a helper to set the status correctly when creating/updating.
   */
  getSubmissionStatus(
    submittedAt: Date | null,
    lastSavedAt: Date,
  ): 'draft' | 'submitted' | 'locked' {
    if (submittedAt) {
      // If submitted, check if within edit window
      return this.isWithinEditWindow(submittedAt) ? 'submitted' : 'locked';
    }
    // If not submitted, it's a draft
    return 'draft';
  }

  /**
   * Calculate the edit deadline based on submitted_at.
   * @param submittedAt The submission timestamp
   * @returns The edit deadline (submitted_at + 24 hours)
   */
  calculateEditDeadline(submittedAt: Date): Date {
    return new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000);
  }
}