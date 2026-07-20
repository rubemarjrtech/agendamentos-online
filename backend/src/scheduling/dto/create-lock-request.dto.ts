import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateLockRequestDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;
}
