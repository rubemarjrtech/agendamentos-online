import type { TimeSlotDto } from '@scheduling/types/time-slot.type';

export class AvailabilityResponseDto {
  date: string;
  serviceId: string;
  slots: TimeSlotDto[];
}
