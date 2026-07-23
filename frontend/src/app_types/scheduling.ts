export type SchedulingSlotStatus = 'AVAILABLE' | 'LOCKED' | 'OCCUPIED';

export interface SchedulingTimeSlot {
  time: string;
  status: SchedulingSlotStatus;
}

export interface SchedulingAvailabilityResponse {
  date: string;
  serviceId: string;
  slots: SchedulingTimeSlot[];
}

export interface SchedulingLockResponse {
  success: boolean;
  lockKey?: string;
  expiresAt?: string;
  message?: string;
}

export interface SchedulingAppointmentResponse {
  id: string;
  userId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

export interface SchedulingLockRequest {
  serviceId: string;
  date: string;
  time: string;
}

export interface SchedulingAppointmentRequest {
  clientPhone: string;
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
}
