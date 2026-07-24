export type AdminAppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface AdminAppointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  status: AdminAppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAppointmentsResponse {
  appointments: AdminAppointment[];
  total: number;
}

export interface UpdateAdminAppointmentStatusRequest {
  status: AdminAppointmentStatus;
}
