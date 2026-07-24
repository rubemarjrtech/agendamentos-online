import { api } from '@lib/axios';
import type {
  AdminAppointmentsResponse,
  AdminAppointment,
  AdminAppointmentStatus,
  UpdateAdminAppointmentStatusRequest,
} from '@app_types/admin';

export interface GetAdminAppointmentsParams {
  date?: string;
  status?: AdminAppointmentStatus;
}

export async function getAdminAppointments(params?: GetAdminAppointmentsParams) {
  const { data } = await api.get<AdminAppointmentsResponse>('/api/admin/appointments', {
    params,
  });

  return data;
}

export async function updateAdminAppointmentStatus(
  appointmentId: string,
  payload: UpdateAdminAppointmentStatusRequest,
) {
  const { data } = await api.patch<AdminAppointment>(
    `/api/admin/appointments/${appointmentId}/status`,
    payload,
  );

  return data;
}

export async function deleteAdminAppointment(appointmentId: string) {
  await api.delete(`/api/admin/appointments/${appointmentId}`);
}
