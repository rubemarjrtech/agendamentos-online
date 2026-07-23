import { api } from '@lib/axios';
import type {
  SchedulingAppointmentRequest,
  SchedulingAppointmentResponse,
  SchedulingAvailabilityResponse,
  SchedulingLockRequest,
  SchedulingLockResponse,
} from '@app_types/scheduling';

export async function getSchedulingAvailability(serviceId: string, date: string) {
  const { data } = await api.get<SchedulingAvailabilityResponse>('/api/scheduling/availability', {
    params: { serviceId, date },
  });

  return data;
}

export async function createSchedulingLock(payload: SchedulingLockRequest) {
  const { data } = await api.post<SchedulingLockResponse>('/api/scheduling/locks', payload);

  return data;
}

export async function confirmSchedulingAppointment(payload: SchedulingAppointmentRequest) {
  const { data } = await api.post<SchedulingAppointmentResponse>(
    '/api/scheduling/appointments',
    payload,
  );

  return data;
}
