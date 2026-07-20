import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CheckAvailabilityRequestDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;
}
