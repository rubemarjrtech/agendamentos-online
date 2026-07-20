export class AppointmentResponseDto {
  id: string;
  userId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  time: string;
  status: string;
  createdAt: Date;
}
