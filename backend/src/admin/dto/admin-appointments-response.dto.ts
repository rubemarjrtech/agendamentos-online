import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AdminAppointmentDetailDto } from './admin-appointment-detail.dto';

export class AdminAppointmentsResponseDto {
  @ValidateNested({ each: true })
  @Type(() => AdminAppointmentDetailDto)
  appointments: AdminAppointmentDetailDto[];

  total: number;
}
