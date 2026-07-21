import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateStatusRequestDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
