import type { FindServicesResponse } from '@app_types/appointment-services';
import { api } from '@lib/axios';

export async function getAppointmentServices(): Promise<FindServicesResponse[]> {
  const { data } = await api.get<FindServicesResponse[]>('/api/services');

  return data;
}
