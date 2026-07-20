import { IsDateString, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateAppointmentRequestDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsPhoneNumber('BR', { message: 'Número de telefone inválido. Ex: +5511999999999' })
  @IsString()
  @IsNotEmpty()
  clientPhone: string;
}
